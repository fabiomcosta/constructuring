#!/usr/bin/env node --harmony
/* jshint esnext:true, eqnull:true */
'strict mode';

var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var UUIDCreator = require('./lib/UUIDCreator');
var utils = require('./lib/utils');
var p = utils.p, log = utils.log;


function createTemporaryVariableDeclaration(id, value) {
  var path = this.path();
  var parentArray = this.root;
  var i = path.length;
  var closestArrayIndex;

  while (i--) {
    // function, program, blockstatement, labelstatement (etc) body
    if (typeof path[i] === 'number' && path[i-1] === 'body') {
      closestArrayIndex = path[i];
      for (var y = 0; y < i; y++) {
        parentArray = parentArray[path[y]];
      }
      break;
    }
  }
  if (closestArrayIndex === null) {
    // This should never happen, every 'Program' root node has a 'body' array
    throw new Error(
      'Couldn\'t find a place to insert the temporary variables ' +
      'declarations.'
    );
  }

  var temporaryVariableId = {
    type: Syntax.Identifier,
    name: id
  };
  var tempVar = {
    'type': Syntax.VariableDeclarator,
    'id': temporaryVariableId,
    'init': value
  };

  // check if we can merge this temp declaration inside
  // the previous variable declarator
  var previousDeclaration = parentArray[closestArrayIndex-1];
  if (previousDeclaration.type === Syntax.VariableDeclaration) {
    previousDeclaration.declarations.push(tempVar);
  } else {
    var tempVarDeclaration = {
      'type': Syntax.VariableDeclaration,
      'declarations': [tempVar],
      'kind': 'var'
    };
    parentArray.splice(closestArrayIndex, 0, tempVarDeclaration);
  }

  return temporaryVariableId;
}

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
            rightElement = createTemporaryVariableDeclaration.call(
              this,
              getId(),
              rightElement
            );
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
  var cacheVariable = createTemporaryVariableDeclaration.call(
    this,
    getId(),
    current.right
  );

  var leftElements = current.left.elements;
  for (var i = 0; i < leftElements.length; i++) {
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
  var undef = {
    type: Syntax.Identifier,
    name: 'undefined'
  };

  for (var i = 0; i < leftElements.length; i++) {
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
        rightSideArrayExpression.call(this, current, node, getId);
        break;

      // Right is an identifier. Ex: [a, b] = c;
      case Syntax.Identifier:
        rightSideIdentifier.call(this, current, node);
        break;

      // Right is a function call. Ex: [a, b] = c();
      case Syntax.CallExpression:
        rightSideCallExpression.call(this, current, node, getId);
        break;

      // Right is a literal. Ex: [a, b] = 1;
      case Syntax.Literal:
        rightSideLiteral.call(this, current, node, getId);
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
  var getId = new UUIDCreator(ast).getTemporaryUUIDCreator();
  var result = estraverse.replace(ast, {
    enter: function(node) {
      var propMap = propertiesMap[node.type];
      switch (node.type) {
        case Syntax.VariableDeclarator:
        case Syntax.AssignmentExpression:
          return rewriteAssigmentNode.call(this, node, propMap, getId);
      }
      return node;
    }
  });
  return escodegen.generate(result, codegenOptions);
}

module.exports = {
  transform: transform
};
