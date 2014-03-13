#!/usr/bin/env node --harmony
/* jshint esnext:true */
'strict mode';

var assert = require('assert');
var esprima = require('esprima');

var transform = require('./index').transform;
var UUIDCreator = require('./UUIDCreator');

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
    var _$$0 = a;
    a = b, b = _$$0;
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
    var _$$1 = b;
    var _$$0 = a;
    a = c, b = _$$0, c = _$$1;
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
    var _$$0 = c();
    a = _$$0[0], b = _$$0[1];
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
    var _$$0 = d();
    (a = _$$0[0], b = _$$0[1]), c = 3;
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
    var _$$0 = c();
    a = _$$0[0], b = _$$0[1];
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
    var _$$0 = c();
    a = _$$0[0], b = _$$0[1];
  }
).checkThrows(
  TypeError,
  'TypeError: Cannot read property \'0\' of null'
);
assertSrcEquals(
  'Destructuring complex nested sequence expression',
  function() {
    var f = [1, 2], h = [8];
    var i = function () { return; };
    [[a, b], c, [d, e]] = [f, i(), [,5]], [g] = h;
  },
  function() {
    var f = [1, 2], h = [8];
    var h = function () { return; };
    ((a = f[0], b = f[1]), c = i(), (d = undefined, e = 5)), (g = h[0]);
  }
).andAssert(
  function() {
    a === 1 && b === 2 && c[0] === 3 && c[1] === 4 &&
      d === [][0] && e ===5 && g === 8;
  }
);
assertSrcEquals(
  'Destructuring array weird case with function call on the right that returns null'
);

