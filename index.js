#!/usr/bin/env node --harmony
/* jshint esnext:true, eqnull:true */
'strict mode';

var esprima = require('esprima');
var escodegen = require('escodegen');
var Syntax = esprima.Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var getIdCreator = require('./lib/getIdCreator');
var DeclarationWrapper = require('./lib/DeclarationWrapper');
var utils = require('./lib/utils');
var p = utils.p, log = utils.log;


function createTemporaryVariableDeclaration(id, value) {
  var temporaryVariableId = b.identifier(id);
  var tempVar = b.variableDeclarator(
    temporaryVariableId,
    value
  );
  if (n.VariableDeclarator.check(this.node)) {
    this.replace(tempVar, this.node);
    // WARN: this can be dangerous and depends on internals from ast-types to
    // work.
    // `this.name` is the position of this node on its parent's children array
    this.name++;
  } else {
    var path = this;
    while ((path = path.parentPath)) {
      if (typeof path.name === 'number') {
        var parent = path.parentPath;
        if (parent.name === 'body') {
          var previousNode = parent.value[path.name-1];
          if (n.VariableDeclaration.check(previousNode)) {
            previousNode.declarations.push(tempVar);
          } else {
            var tempVarDeclaration = b.variableDeclaration('var', [tempVar]);
            parent.value.splice(path.name, 0, tempVarDeclaration);
          }
          break;
        }
      }
    }
  }
  return temporaryVariableId;
}

// Adds declarations that transfer the values from an identifier on the
// right to the ones on the left ArrayPattern.
// Ex: [a, b] = c --> a = c[0], b = c[1]
function addTransferDeclarations(node, rightIdentifier) {
  var leftElements = node.left.elements;
  for (var i = 0; i < leftElements.length; i++) {
    var rightElement = b.memberExpression(
      rightIdentifier,
      b.literal(i),
      true // computed
    );
    node.addDeclaration(leftElements[i], rightElement);
  }
}

function rightSideArrayExpression(node, getId) {
  var leftElements = node.left.elements;
  var rightElements = node.right.elements;
  var cacheVariable;

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
      if (!cacheVariable) {
        cacheVariable = createTemporaryVariableDeclaration.call(
          this,
          getId(),
          node.right
        );
      }
      rightElement = b.memberExpression(
        cacheVariable,
        b.literal(i),
        true // computed
      );
    } else if (n.Identifier.check(rightElement)) {
      // Verify if this identifier was a leftElement before. In this case
      // we will have to create a temporary variable to keep the value of the
      // identifier so we can set it properly to the left identifier
      // Ex: [x, y] = [y, x]
      if (node.isAlreadyDeclared(rightElement)) {
        rightElement = createTemporaryVariableDeclaration.call(
          this,
          getId(),
          rightElement
        );
      }
    }

    node.addDeclaration(leftElement, rightElement);
  }
}

function rightSideIdentifier(node) {
  addTransferDeclarations(node, node.right);
}

function rightSideCallExpression(node, getId) {
  var cacheVariable = createTemporaryVariableDeclaration.call(
    this,
    getId(),
    node.right
  );
  addTransferDeclarations(node, cacheVariable);
}
var rightSideLiteral = rightSideCallExpression;


function ObjectLookupPropertyWithKey(objectExpression, key) {
  for (var i = 0; i < objectExpression.length; i++) {
    var property = objectExpression[i];
    if (property.key.name === key.name) {
      return property;
    }
  }
}

function rightSideObjectExpression(node, getId) {
  var leftProperties = node.left.properties;
  var rightProperties = node.right.properties;

  for (var i = 0; i < leftProperties.length; i++) {
    var leftProperty = leftProperties[i];
    var rightProperty = ObjectLookupPropertyWithKey(
      rightProperties,
      leftProperty.key
    );
    node.addDeclaration(leftProperty.key, rightProperty.value);
  }
}

function rewriteAssigmentNode(node, getId) {

  if (node.left) {
    if (!node.right) {
      return;
    }

    if (n.ArrayPattern.check(node.left)) {
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

    } else if (n.ObjectPattern.check(node.left)) {

      switch (node.right.type) {
        // Right is an object. Ex: ({a}) = {a: 1};
        case Syntax.ObjectExpression:
          rightSideObjectExpression.call(this, node, getId);
          break;
      }

    }

    if (n.ArrayPattern.check(node.left) || n.ObjectPattern.check(node.left)) {
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

function transform(ast, options) {
  options = options || {};
  var getId = getIdCreator(options.idPrefix);
  var result = types.traverse(ast, function(node) {
    traverse.call(this, node, getId);
  });
  return result;
}

function transformSource(source, transformOptions, codegenOptions) {
  var ast = esprima.parse(source);
  return escodegen.generate(transform(ast, transformOptions), codegenOptions);
}

module.exports = {
  transform: transform,
  transformSource: transformSource
};
