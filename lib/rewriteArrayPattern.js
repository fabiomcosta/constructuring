/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var utils = require('./utils');
var p = utils.p, log = utils.log;


function createTemporaryVariableDeclaration(id, value, node) {
  var temporaryVariableId = b.identifier(id);
  if (!n.VariableDeclarator.check(this.node)) {
    // Get the BlockStatement body in case there is one.
    // TODO This could be safer, maybe checking if 'body' is an array?
    var body = this.scope.node.body.body || this.scope.node.body;
    var firstNode = body[0];
    var tempVar = b.variableDeclarator(temporaryVariableId, null);
    if (n.VariableDeclaration.check(firstNode)) {
      firstNode.declarations.push(tempVar);
    } else {
      body.unshift(b.variableDeclaration('var', [tempVar]));
    }
  }
  node.unshiftDeclaration(temporaryVariableId, value);
  return temporaryVariableId;
}

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

function rightSideAssignmentExpression(getId) {
  // ugly way of avoiding cyclic dependency between modules :/
  // TODO this can be 'init' sometimes
  var replacementExpressions =
    require('./rewriteAssignmentNode').call(this.get('right'), getId);
  if (replacementExpressions.length !== 1) {
    throw new Error(
      'Why is the replacemenent array bigger than one?'
    );
  }
  var replacementExpression = replacementExpressions[0];
  if (!n.SequenceExpression.check(replacementExpression)) {
    throw new Error(
      'Something unexpected happened, why isn\'t this a ' +
      'SequenceExpression?'
    );
  }
  return replacementExpression;
}

function rewriteArrayPattern(node, getId) {
  switch (node.right.type) {
    // [c, d] = [a, b] = [1, 2];
    case Syntax.AssignmentExpression:
      node.right = rightSideAssignmentExpression.call(this, getId);

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
