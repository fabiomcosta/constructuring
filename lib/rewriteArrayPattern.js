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


// Adds declarations that transfer the values from an identifier on the
// right to the ones on the left ArrayPattern.
// Ex: [a, b] = c --> a = c[0], b = c[1]
function rightSideIdentifier(node, rightIdentifier) {
  var leftElements = node.left.elements;
  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    if (!leftElement) {
      continue;
    }
    var rightElement = b.memberExpression(
      rightIdentifier,
      b.literal(i),
      true // computed
    );
    node.pushDeclaration(leftElement, rightElement);
  }
  // Variable declarations always evaluate to undefined so we don't need
  // to make it return the 'init' (right) value.
  if (!n.VariableDeclarator.check(this.node)) {
    node.pushDeclaration(rightIdentifier, null);
  }
}

function rightSideCache(node, getId) {
  var cacheVariable = createTemporaryVariableDeclaration.call(
    this,
    getId(),
    node.right,
    node
  );
  rightSideIdentifier.call(this, node, cacheVariable);
}

function rewriteArrayPattern(node, getId) {
  switch (node.right.type) {
    // [c, d] = [a, b] = [1, 2];
    case Syntax.AssignmentExpression:
      node.right = rightSideAssignmentExpression.call(this, getId);

    // [a, b] = new Contructor();
    case Syntax.NewExpression:
    // [a, b] = yield c;
    case Syntax.YieldExpression:
    // [a, b] = [b, a];
    case Syntax.ArrayExpression:
    // [a, b] = c[0];
    // [a, b] = c.prop;
    case Syntax.MemberExpression:
    // [a, b] = c();
    case Syntax.CallExpression:
    // [a, b] = 1;
    case Syntax.Literal:
    // [a, b] = (a = 4);
    case Syntax.SequenceExpression:
      rightSideCache.call(this, node, getId);
      break;

    // [a, b] = c;
    case Syntax.Identifier:
      rightSideIdentifier.call(this, node, node.right);
      break;
  }
}

module.exports = rewriteArrayPattern;
