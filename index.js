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

var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;


function createTemporaryVariableDeclaration(id, value) {
  var temporaryVariableId = b.identifier(id);
  var tempVar = b.variableDeclarator(
    temporaryVariableId,
    value
  );

  // check if we can merge this temp declaration inside
  // the previous variable declarator
  var scopeNode = this.scope.node;
  var firstDeclaration = scopeNode.body[0];
  if (n.VariableDeclaration.check(firstDeclaration)) {
    firstDeclaration.declarations.push(tempVar);
  } else {
    var tempVarDeclaration = b.variableDeclaration('var', [
      tempVar
    ]);
    scopeNode.body.unshift(tempVarDeclaration);
  }

  return temporaryVariableId;
}

function rightSideArrayExpression(current, node, getId) {
  var leftElements = current.left.elements;
  var rightElements = current.right.elements;

  for (var i = 0; i < leftElements.length; i++) {
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
      rightElement = b.identifier('undefined');
    } else {
      // Verify if this identifier was a leftElement before. In this case
      // we will have to create a temporary variable to keep the value of the
      // identifier so we can set it properly to the left identifier
      // Ex: [x, y] = [y, x]
      if (n.Identifier.check(rightElement)) {
        for (var y = 0; y < node.declarations.length; y++) {
          var left = node.declarations[y].left;
          if (n.Identifier.check(left) && left.name === rightElement.name) {
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

    node.addDeclaration(leftElement, rightElement);
  }
}

function rightSideIdentifier(current, node) {
  var leftElements = current.left.elements;
  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    var rightElement = b.memberExpression(
      current.right,
      b.literal(i),
      true // computed
    );
    node.addDeclaration(leftElement, rightElement);
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
    var rightElement = b.memberExpression(
      cacheVariable,
      b.literal(i),
      true // computed
    );
    node.addDeclaration(leftElement, rightElement);
  }
}

function rightSideLiteral(current, node, getId) {
  var undef = b.identifier('undefined');
  var leftElements = current.left.elements;
  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    node.addDeclaration(leftElement, undef);
  }
}

function rewriteAssigmentNode(node, declarationWrapper, getId) {

  if (node.left && n.ArrayPattern.check(node.left)) {
    if (!node.right) {
      return;
    }

    switch (node.right.type) {
      // Right is an array. Ex: [a, b] = [b, a];
      case Syntax.ArrayExpression:
        rightSideArrayExpression.call(this, node, declarationWrapper, getId);
        break;

      // Right is an identifier. Ex: [a, b] = c;
      case Syntax.Identifier:
        rightSideIdentifier.call(this, node, declarationWrapper);
        break;

      // Right is a function call. Ex: [a, b] = c();
      case Syntax.CallExpression:
        rightSideCallExpression.call(this, node, declarationWrapper, getId);
        break;

      // Right is a literal. Ex: [a, b] = 1;
      case Syntax.Literal:
        rightSideLiteral.call(this, node, declarationWrapper, getId);
        break;
    }

    // recursively transforms other assignments, for nested arrays for example
    transform(this.replace.apply(this, declarationWrapper.getNodes())[0], getId);
  }

}

function transform(ast, getId) {
  getId = getId || new UUIDCreator(ast).getTemporaryUUIDCreator();

  var result = types.traverse(ast, function(node) {
    if (
      n.VariableDeclarator.check(node) ||
      n.AssignmentExpression.check(node)
    ) {
      var declarationWrapper = new DeclarationWrapper(this);
      rewriteAssigmentNode.call(this, node, declarationWrapper, getId);
    }
  });

  return result;
}

// Wrapper for a VariableDeclaration or SequenceExpression node.
// Since these nodes have different property names this class
// contains a single API for manipulating the similar properties.
// Defines if the wrapper will use a VariableDeclaration or SequenceExpression
// based on `node`.
var DeclarationWrapper = function(path) {
  this._isVarDeclarator = n.VariableDeclarator.check(path.node);

  // An AssignmentExpression not always has a SequenceExpression as parent
  // lets check this and create one if this is false
  var parent;
  if (!this._isVarDeclarator && !n.SequenceExpression.check(path.parent.node)) {
    parent = this._sequenceExpression = b.sequenceExpression([]);
  } else {
    parent = path.parent.node;
  }
  this.declarations = parent.declarations || parent.expressions;
  this._replacements = [];
};
DeclarationWrapper.prototype._getAssignmentFor = function(left, right) {
  // NOTE update this to use ast-types. Make it support ArrayPattern
  // as the 'left' property
  if (this._isVarDeclarator) {
    return {
      'type': Syntax.VariableDeclarator,
      'id': left,
      'init': right
    };
  }
  return {
    'type': Syntax.AssignmentExpression,
    'operator': '=',
    'left': left,
    'right': right
  };
};
DeclarationWrapper.prototype.addDeclaration = function(left, right) {
  var assignment = this._getAssignmentFor(left, right);
  if (this._sequenceExpression) {
    this._sequenceExpression.expressions.push(assignment);
  } else {
    this._replacements.push(assignment);
  }
  return this;
};
DeclarationWrapper.prototype.getNodes = function() {
  if (this._sequenceExpression) {
    return [this._sequenceExpression];
  }
  return this._replacements;
};


function transformSource(source, codegenOptions) {
  var ast = esprima.parse(source);
  return escodegen.generate(transform(ast), codegenOptions);
}

module.exports = {
  transform: transform,
  transformSource: transformSource
};
