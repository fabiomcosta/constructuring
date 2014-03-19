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
        for (var y = 0; y < node.expressions.length; y++) {
          var left = node.expressions[y].left;
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

    // NOTE update this to use ast-types. Make it support ArrayPattern
    // as the 'left' property
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
    var expression = b.assignmentExpression(
      '=',
      leftElement,
      b.memberExpression(
        current.right,
        b.literal(i),
        true // computed
      )
    );
    node.expressions.push(expression);
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
    var expression = b.assignmentExpression(
      '=',
      leftElement,
      b.memberExpression(
        cacheVariable,
        b.literal(i),
        true // computed
      )
    );
    node.expressions.push(expression);
  }
}

function rightSideLiteral(current, node, getId) {
  var leftElements = current.left.elements;
  var undef = b.identifier('undefined');

  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    node.expressions.push(
      b.assignmentExpression('=', leftElement, undef)
    );
  }
}

function rewriteAssigmentNode(node, getId) {

  if (node.left && node.left.type === Syntax.ArrayPattern) {
    if (!node.right) {
      return;
    }

    var replacementNode = b.sequenceExpression([]);

    switch (node.right.type) {
      // Right is an array. Ex: [a, b] = [b, a];
      case Syntax.ArrayExpression:
        rightSideArrayExpression.call(this, node, replacementNode, getId);
        break;

      // Right is an identifier. Ex: [a, b] = c;
      case Syntax.Identifier:
        rightSideIdentifier.call(this, node, replacementNode);
        break;

      // Right is a function call. Ex: [a, b] = c();
      case Syntax.CallExpression:
        rightSideCallExpression.call(this, node, replacementNode, getId);
        break;

      // Right is a literal. Ex: [a, b] = 1;
      case Syntax.Literal:
        rightSideLiteral.call(this, node, replacementNode, getId);
        break;
    }

    // recursively transforms other assignments, for nested arrays for example
    transform(this.replace(replacementNode)[0], getId);
  }

}

function transform(ast, getId) {
  getId = getId || new UUIDCreator(ast).getTemporaryUUIDCreator();

  var result = types.traverse(ast, function(node) {
    if (n.VariableDeclarator.check(node) || n.AssignmentExpression.check(node)) {
      rewriteAssigmentNode.call(this, node, getId);
    }
  });

  return result;
}

function transformSource(source, codegenOptions) {
  var ast = esprima.parse(source);
  return escodegen.generate(transform(ast), codegenOptions);
}

module.exports = {
  transform: transform,
  transformSource: transformSource
};
