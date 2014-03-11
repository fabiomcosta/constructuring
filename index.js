#!/usr/bin/env node --harmony
/* jshint esnext:true */
'strict mode';

var fs = require('fs');
var util = require('util');
var assert = require('assert');
var escope = require('escope');
var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

function log(obj) {
  console.log(util.inspect(obj, {depth: null, colors: true}));
}

function p(obj) {
  console.log('******************');
  log(obj);
  console.log('******************');
}


// AST with mozilla's format, from esprima for example
var UUIDCreator = function(ast) {
  this.scopeManager = escope.analyze(ast);
  this.resetState();
};
UUIDCreator.prototype.resetState = function() {
  this._ids = [];
  this._inc = 0;
  this._identifierPrefix = '_$$';
};
UUIDCreator.prototype.isUsedIdentifier = function(name) {
  return this.scopeManager.scopes.some(function(scope) {
    return scope.isUsedName(name);
  });
};
UUIDCreator.prototype.get = function() {
  while (true) {
    var name = this._identifierPrefix + this._inc;
    this._inc++;
    if (!this.isUsedIdentifier(name)) {
      return name;
    }
  }
  throw new Error('This error should never be seen, there is something ' +
                  'really nasty happening and no UUID could be generated.');
};
// Returns a function that creates uuids for temporary use.
// The benefit of this is that the generated ids can be reused by future
// instances of this same class.
UUIDCreator.prototype.getTemporaryUUIDCreator = function() {
  var index = 0;
  return function() {
    var id = this._ids[index];
    if (!id) {
      id = this.get();
      this._ids[index] = id;
    }
    index++;
    return id;
  }.bind(this);
};

function rightSideArrayExpression(current, node, getId) {
  var leftElements = current.left.elements;
  var rightElements = current.right.elements;
  var len = leftElements.length;

  for (var i = 0; i < len; i++) {
    var leftElement = leftElements[i];
    var rightElement = rightElements[i];

    // Sometimes there are missing elements on the left side
    // Ex: [,a] = [1, 2]
    if (!leftElement) {
      continue;
    }

    // Sometimes there are missing or less elements on the right side
    // Ex: [a, b, c] = [,1]
    if (!rightElement) {
      rightElement = {
        type: Syntax.Identifier,
        name: 'undefined'
      };
    } else {
      // Verify if this identifier was a leftElement before. In this case
      // we will have to create a temporary variable to keep the value of the
      // identifier so we can set it properly to the left identifier
      // Ex: [x, y] = [y, x]
      if (rightElement.type === Syntax.Identifier) {
        for (var y = 0; y < node.expressions.length; y++) {
          var left = node.expressions[y].left;
          if (left.type === Syntax.Identifier && left.name === rightElement.name) {
            var currentRightElement = rightElement;
            rightElement = {
              type: Syntax.Identifier,
              name: getId()
            };
            node.expressions.unshift({
              'type': Syntax.AssignmentExpression,
              'operator': '=',
              'left': rightElement,
              'right': currentRightElement
            });
            break;
          }
        }
      }
    }

    node.expressions.push({
      'type': Syntax.AssignmentExpression,
      'operator': '=',
      'left': leftElement,
      'right': rightElement
    });
  }
}

function rightSideIdentifier(current, node) {
  var leftElements = current.left.elements;
  var len = leftElements.length;

  for (var i = 0; i < len; i++) {
    var leftElement = leftElements[i];
    node.expressions.push({
      'type': Syntax.AssignmentExpression,
      'operator': '=',
      'left': leftElement,
      'right': {
        'type': Syntax.MemberExpression,
        'computed': true,
        'object': current.right,
        'property': {
          'type': Syntax.Literal,
          'value': i,
          'raw': String(i)
        }
      }
    });
  }
}

function rightSideCallExpression(current, node, getId) {
  var cacheVariable = {
    type: Syntax.Identifier,
    name: getId()
  };
  node.expressions.push({
    'type': Syntax.AssignmentExpression,
    'operator': '=',
    'left': cacheVariable,
    'right': current.right
  });

  var leftElements = current.left.elements;
  var len = leftElements.length;

  for (var i = 0; i < len; i++) {
    var leftElement = leftElements[i];
    node.expressions.push({
      'type': Syntax.AssignmentExpression,
      'operator': '=',
      'left': leftElement,
      'right': {
        'type': Syntax.MemberExpression,
        'computed': true,
        'object': cacheVariable,
        'property': {
          'type': Syntax.Literal,
          'value': i,
          'raw': String(i)
        }
      }
    });
  }
}

function rightSideLiteral(current, node, getId) {
  var leftElements = current.left.elements;
  var len = leftElements.length;
  var undef = {
    type: Syntax.Identifier,
    name: 'undefined'
  };

  for (var i = 0; i < len; i++) {
    var leftElement = leftElements[i];
    node.expressions.push({
      'type': Syntax.AssignmentExpression,
      'operator': '=',
      'left': leftElement,
      'right': undef
    });
  }
}

function rewriteAssigmentNode(current, propMap, getId) {
  var node = current;

  if (current.left && current.left.type === Syntax.ArrayPattern) {
    if (!current.right) {
      return node;
    }

    node = {
      type: Syntax.SequenceExpression,
      expressions: []
    };

    switch (current.right.type) {
      // Right is an array. Ex: [a, b] = [b, a];
      case Syntax.ArrayExpression:
        rightSideArrayExpression(current, node, getId);
        break;

      // Right is an identifier. Ex: [a, b] = c;
      case Syntax.Identifier:
        rightSideIdentifier(current, node);
        break;

      // Right is a function call. Ex: [a, b] = c();
      case Syntax.CallExpression:
        rightSideCallExpression(current, node, getId);
        break;

      // Right is a literal. Ex: [a, b] = 1;
      case Syntax.Literal:
        rightSideLiteral(current, node, getId);
        break;
    }
  }

  return node;
}

var propertiesMap = {};
propertiesMap[Syntax.AssigmentExpression] = {
  expressions: 'expressions',
  left: 'left',
  right: 'right'
};
propertiesMap[Syntax.VariableDeclarator] = {
  expressions: 'declarations',
  left: 'id',
  right: 'init'
};

function transform(source, codegenOptions) {
  var ast = esprima.parse(source);
  var uuidCreator = new UUIDCreator(ast);
  var result = estraverse.replace(ast, {
    enter: function(node) {
      var propMap = propertiesMap[node.type];
      switch (node.type) {
        case Syntax.VariableDeclarator:
        case Syntax.AssignmentExpression:
          var getId = uuidCreator.getTemporaryUUIDCreator();
          return rewriteAssigmentNode(node, propMap, getId);
      }
      return node;
    }
  });
  return escodegen.generate(result, codegenOptions);
}

// tests

function makeSrc(fn) {
  if (typeof fn === 'string') {
    return fn;
  }
  var src = String(fn).trim();
  src = src.replace(/^function[^(]*\([^)]*\)\s*{/, '');
  src = src.replace(/}$/, '');
  return sanitizeSource(src);
}

function sanitizeSource(src) {
  src = src.replace(/[\n\t ]+/g, ' ');
  src = src.replace(/\[\s+/g, '['); // remove space inside [. [ 1] -> [1]
  src = src.replace(/\s+\]/g, ']'); // remove space inside ]. [1 ] -> [1]
  return src.trim();
}

function checkDestructuringSupport() {
  try {
    eval('"strict mode"; var [a] = [1];');
  } catch (e) {
    if (e instanceof SyntaxError) {
      return false;
    }
  }
  return true;
}
var supportsDestructuring = checkDestructuringSupport();

function assertSrcEquals(msg, referenceFn, compareFn) {
  assert(typeof msg === 'string', '"' + msg + '" is not a string');
  console.log(msg);
  if (arguments.length === 1) {
    // for placeholder asserts
    return;
  }
  var codegenOptions = {format: {newline: ' ', indent: {style: ''}}};
  var referenceSrc = makeSrc(referenceFn);
  var transformedReferenceSrc = sanitizeSource(transform(referenceSrc, codegenOptions));
  var compareSrc = makeSrc(compareFn);
  assert(
    transformedReferenceSrc === compareSrc,
    '"' + transformedReferenceSrc + '" is not equal to "' + compareSrc + '"'
  );
  return {
    andAssert: function(assertFn) {
      var assertSrc = makeSrc(assertFn);
      if (supportsDestructuring) {
        assert(
          eval(referenceSrc + assertSrc),
          '"' + referenceSrc + '" did not pass the assert test "' + assertSrc + '"'
        );
      }
      assert(
        eval(compareSrc + assertSrc),
        '"' + compareSrc + '" did not pass the assert test "' + assertSrc + '"'
      );
    },
    checkThrows: function(errorType, message) {
      var refThrew = true;
      if (supportsDestructuring) {
        refThrew = false;
        try {
          eval(referenceSrc);
        } catch(e) {
          refThrew = true;
          assert(
            e instanceof errorType,
            '"' + referenceSrc + '" did not throw "' + errorType + '"'
          );
        }
        // TODO should we also check for the same message on the
        // reference source?
      }
      var compThrew = false;
      try {
        eval(compareSrc);
      } catch(e) {
        compThrew = true;
        assert(
          e instanceof errorType,
          '"' + compareSrc + '" did not throw "' + errorType + '"'
        );
        if (message) {
          assert(
            String(e) === message,
            '"' + String(e) + '" is not equal "' + message + '"'
          );
        }
      }
      assert(
        refThrew && compThrew,
        '"' + errorType + '" wasn\'t thrown'
      );
    }
  };
}

(function() {

  var testFn = function() {
    var _$$3 = 3;
    (function() {
      'use strict';
      { let _$$1 = 1; }
    }());
  };

  var ast = esprima.parse(makeSrc(testFn));
  var uuidCreator = new UUIDCreator(ast);
  tmpCreator = uuidCreator.getTemporaryUUIDCreator();

  assert(tmpCreator() === '_$$0');
  assert(tmpCreator() === '_$$2');
  assert(tmpCreator() === '_$$4');

}());

assertSrcEquals(
  'Destructuring array 1 element',
  function() {
    [a] = [1];
  },
  function() {
    a = 1;
  }
).andAssert(
  function() {
    a === 1;
  }
);
// assertSrcEquals(
//   'Destructuring array 1 element with var',
//   'var [a] = [1];',
//   function() {
//     var a = 1;
//   }
// ).andAssert(
//   function() {
//     a === 1;
//   }
// );
assertSrcEquals(
  'Destructuring array 2 elements',
  function() {
    [a, b] = [1, 2];
  },
  function() {
    a = 1, b = 2;
  }
).andAssert(
  function() {
    a === 1 && b === 2;
  }
);
assertSrcEquals(
  'Destructuring array with bigger right',
  function() {
    [a, b] = [1, 2, 3];
  },
  function() {
    a = 1, b = 2;
  }
).andAssert(
  function() {
    a === 1 && b === 2;
  }
);
assertSrcEquals(
  'Destructuring array with bigger left',
  function() {
    [a, b, c] = [1, 2];
  },
  // The last value becomes undefined (Firefox 29.0a2 (2014-03-09))
  function() {
    a = 1, b = 2, c = undefined;
  }
).andAssert(
  function() {
    a === 1 && b === 2 && c === [][0];
  }
);
assertSrcEquals(
  'Destructuring array with missing element on left',
  function() {
    [,a] = [1, 2];
  },
  function() {
    a = 2;
  }
).andAssert(
  function() {
    a === 2;
  }
);
assertSrcEquals(
  'Destructuring array with missing elements in the middle of the left',
  function() {
    [,a,,b,,,c] = [1, 2, 3, 4, 5];
  },
  function() {
    a = 2, b = 4, c = undefined;
  }
).andAssert(
  function() {
    a === 2 && b === 4 && c === 0[0];
  }
);
assertSrcEquals(
  'Destructuring array with missing elements in the middle of the right',
  function() {
    [a, b, c] = [,1,,4];
  },
  function() {
    a = undefined, b = 1, c = undefined;
  }
).andAssert(
  function() {
    a === [][0] && b === 1 && c === [][0];
  }
);
assertSrcEquals(
  'Destructuring with identifiers on the right',
  function() {
    var d = 1, e = 2, f = 3;
    [a, b, c] = [d, e, f];
  },
  function() {
    var d = 1, e = 2, f = 3;
    a = d, b = e, c = f;
  }
).andAssert(
  function() {
    d === 1 && e === 2 && f === 3 && a === d && b === e && c === f;
  }
);
assertSrcEquals(
  'Destructuring with identifiers on the right, swapping values',
  function() {
    var a = 1, b = 2;
    [a, b] = [b, a];
  },
  function() {
    var a = 1, b = 2;
    _$$0 = a, a = b, b = _$$0;
  }
).andAssert(
  function() {
    a === 2 && b === 1;
  }
);
assertSrcEquals(
  'Destructuring with identifiers on the right, swapping more than one value',
  function() {
    var a = 1, b = 2, c = 3;
    [a, b, c] = [c, a, b];
  },
  function() {
    var a = 1, b = 2, c = 3;
    _$$1 = b, _$$0 = a, a = c, b = _$$0, c = _$$1;
  }
).andAssert(
  function() {
    a === 3 && b === 1 && c === 2;
  }
);
assertSrcEquals(
  'Destructuring nested array',
  function() {
    [a, [b, c]] = [1, [2, 3]];
  },
  function() {
    a = 1, (b = 2, c = 3);
  }
).andAssert(
  function() {
    a === 1 && b === 2 && c === 3;
  }
);
assertSrcEquals(
  'Destructuring array with identifier on the right',
  function() {
    var c = [1, 2];
    [a, b] = c;
  },
  function() {
    var c = [1, 2];
    a = c[0], b = c[1];
  }
).andAssert(
  function() {
    a === 1 && b === 2;
  }
);
assertSrcEquals(
  'Destructuring array with function call on the right',
  function() {
    var c = function () { return [, 1]; };
    [a, b] = c();
  },
  function() {
    var c = function () { return [, 1]; };
    _$$0 = c(), a = _$$0[0], b = _$$0[1];
  }
).andAssert(
  function() {
    a === [][0] && b === 1;
  }
);
assertSrcEquals(
  'Destructuring nested array with function call inside array on the right',
  function() {
    var d = function () { return [, 1]; };
    [[a, b], c] = [d(), 3];
  },
  function() {
    var d = function () { return [, 1]; };
    (_$$0 = d(), a = _$$0[0], b = _$$0[1]), c = 3;
  }
).andAssert(
  function() {
    a === [][0] && b === 1 && c === 3;
  }
);
assertSrcEquals(
  'Destructuring nested array with identifier on the right',
  function() {
    var d = [1, 2];
    [[a, b], c] = [d, 3];
  },
  function() {
    var d = [1, 2];
    (a = d[0], b = d[1]), c = 3;
  }
).andAssert(
  function() {
    a === 1 && b === 2 && c === 3;
  }
);
// The values on the array pattern become undefined (Firefox 29.0a2 (2014-03-09))
assertSrcEquals(
  'Destructuring array weird case literal on the right',
  function() {
    [a, b] = 1;
  },
  function() {
    a = undefined, b = undefined;
  }
).andAssert(
  function() {
    a === [][0] && b === [][0];
  }
);
assertSrcEquals(
  'Destructuring array weird case with function call on the right that returns literal',
  function() {
    var c = function () { return 1; };
    [a, b] = c();
  },
  function() {
    var c = function () { return 1; };
    _$$0 = c(), a = _$$0[0], b = _$$0[1];
  }
).andAssert(
  function() {
    a === [][0] && b === [][0];
  }
);
// An error is thrown (Firefox 29.0a2 (2014-03-09))
assertSrcEquals(
  'Destructuring array weird case with function call on the right that returns null',
  function() {
    var c = function () { return null; };
    [a, b] = c();
  },
  function() {
    var c = function () { return null; };
    _$$0 = c(), a = _$$0[0], b = _$$0[1];
  }
).checkThrows(
  TypeError,
  'TypeError: Cannot read property \'0\' of null'
);
assertSrcEquals(
  'Destructuring array weird case with function call on the right that returns null'
);

