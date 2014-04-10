/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var createTemporaryVariableDeclaration =
  require('./createTemporaryVariableDeclaration');
var rightSideAssignmentExpression = require('./rightSideAssignmentExpression');
var utils = require('./utils');
var p = utils.p, log = utils.log;


function rightSideCache(node, getId) {
  var cacheVariable = createTemporaryVariableDeclaration.call(
    this,
    getId(),
    node.right,
    node
  );

  var leftElements = node.left.properties;
  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    if (!leftElement) {
      continue;
    }

    var rightElement = b.memberExpression(
      cacheVariable,
      leftElement.key,
      false
    );
    node.pushDeclaration(leftElement, rightElement);
  }
  // Variable declarations always evaluate to undefined so we don't need
  // to make it return the 'init' (right) value.
  if (!n.VariableDeclarator.check(this.node)) {
    node.pushDeclaration(cacheVariable, null);
  }
}

function rewriteObjectPattern(node, getId) {
  switch (node.right.type) {
    case Syntax.AssignmentExpression:
      node.right = rightSideAssignmentExpression.call(this, getId);

    // Right is an object. Ex: ({a}) = {a: 1};
    case Syntax.ObjectExpression:
      rightSideCache.call(this, node, getId);
      // rightSideObjectExpression.call(this, node, getId);
      break;
  }
}

module.exports = rewriteObjectPattern;
