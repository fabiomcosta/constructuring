#!/usr/bin/env node --harmony
/* jshint esnext:true, eqnull:true */
'strict mode';

var esprima = require('esprima');
var escodegen = require('escodegen');
var Syntax = esprima.Syntax;

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
    var tempVarDeclaration = b.variableDeclaration('var', [tempVar]);
    scopeNode.body.unshift(tempVarDeclaration);
  }

  return temporaryVariableId;
}

function rightSideArrayExpression(node, getId) {
  var leftElements = node.left.elements;
  var rightElements = node.right.elements;

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
    } else if (n.Identifier.check(rightElement)) {
      // Verify if this identifier was a leftElement before. In this case
      // we will have to create a temporary variable to keep the value of the
      // identifier so we can set it properly to the left identifier
      // Ex: [x, y] = [y, x]
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

    node.addDeclaration(leftElement, rightElement);
  }
}

function rightSideIdentifier(node) {
  var leftElements = node.left.elements;
  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    var rightElement = b.memberExpression(
      node.right,
      b.literal(i),
      true // computed
    );
    node.addDeclaration(leftElement, rightElement);
  }
}

function rightSideCallExpression(node, getId) {
  var cacheVariable = createTemporaryVariableDeclaration.call(
    this,
    getId(),
    node.right
  );
  var leftElements = node.left.elements;
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

function rightSideLiteral(node, getId) {
  var undef = b.identifier('undefined');
  var leftElements = node.left.elements;
  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    node.addDeclaration(leftElement, undef);
  }
}

function rewriteAssigmentNode(node, getId) {

  if (node.left && n.ArrayPattern.check(node.left)) {
    if (!node.right) {
      return;
    }

    switch (node.right.type) {
      // Right is an array. Ex: [a, b] = [b, a];
      case Syntax.ArrayExpression:
        rightSideArrayExpression.call(this, node, getId);
        break;

      // Right is an identifier. Ex: [a, b] = c;
      case Syntax.Identifier:
        rightSideIdentifier.call(this, node);
        break;

      // Right is a function call. Ex: [a, b] = c();
      case Syntax.CallExpression:
        rightSideCallExpression.call(this, node, getId);
        break;

      // Right is a literal. Ex: [a, b] = 1;
      case Syntax.Literal:
        rightSideLiteral.call(this, node, getId);
        break;
    }

    // Recursively transforms other assignments.
    // For nested ArrayPatterns for example.
    var replacementNodes = this.replace.apply(this, node.getNodes());
    replacementNodes.forEach(function(replacementNode) {
      types.traverse(
        replacementNode,
        function(node) {
          traverse.call(this, node, getId);
        }
      );
    });
  }

}

function traverse(node, getId) {
  if (
    n.VariableDeclarator.check(node) ||
    n.AssignmentExpression.check(node)
  ) {
    var nodeWrapper = new DeclarationWrapper(this);
    rewriteAssigmentNode.call(this, nodeWrapper, getId);
  }
}

function transform(ast) {
  var getId = new UUIDCreator(ast).getTemporaryUUIDCreator();
  var result = types.traverse(ast, function(node) {
    traverse.call(this, node, getId);
  });
  return result;
}

// Wrapper for a VariableDeclaration or SequenceExpression node.
// Since these nodes have different property names this class
// contains a single API for manipulating the similar properties.
// Defines if the wrapper will use a VariableDeclaration or SequenceExpression
// based on `node`.
// This is kind of a dirty class that deals with all the differences
// between these 2 node types.
var DeclarationWrapper = function(path) {
  var node = path.node;
  var parent = path.parent.node;

  this._isVarDeclarator = n.VariableDeclarator.check(node);

  // An AssignmentExpression not always has a SequenceExpression as parent
  // lets check this and create one if this is false
  if (!this._isVarDeclarator && !n.SequenceExpression.check(path.parent.node)) {
    parent = this._sequenceExpression = b.sequenceExpression([]);
  }
  this.declarations = parent.declarations || parent.expressions;
  this.left = node.left || node.id;
  this.right = node.right || node.init;
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
