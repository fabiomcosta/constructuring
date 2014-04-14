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


function rightSideIdentifier(node, rightIdentifier) {
  var leftElements = node.left.properties;
  for (var i = 0; i < leftElements.length; i++) {
    var leftElement = leftElements[i];
    var rightElement = b.memberExpression(
      rightIdentifier,
      leftElement.key,
      false
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

function rewriteObjectPattern(node, getId) {
  switch (node.right.type) {
    // var {b} = {a} = {a: 1, b: 2};
    case Syntax.AssignmentExpression:
      node.right = rightSideAssignmentExpression.call(this, getId);
    /*falls through*/
    default:
    // {a, b} = `str`
    // case Syntax.TemplateLiteral:
    // {a, b} = i18n`str`
    // case Syntax.TaggedTemplateExpression:
    // {a, b} = class X {}
    // case Syntax.ClassExpression:
    // {a, b} = [x for (x of [1,2])]
    // case Syntax.ComprehensionExpression:
    // {a, b} = () => 1
    // case Syntax.ArrowFunctionExpression:
    // {a, b} = -c
    // case Syntax.UnaryExpression:
    // {a, b} = c++
    // case Syntax.UpdateExpression:
    // {a, b} = c ? d : e
    // case Syntax.ConditionalExpression:
    // {a, b} = this
    // case Syntax.ThisExpression:
    // {a, b} = 0 && 1
    // case Syntax.LogicalExpression:
    // {a, b} = c === d
    // case Syntax.BinaryExpression:
    // {a, b} = new Contructor()
    // case Syntax.NewExpression:
    // {a, b} = yield c;
    // case Syntax.YieldExpression:
    // var {a} = {a: 1};
    // case Syntax.ObjectExpression:
      rightSideCache.call(this, node, getId);
      break;

    // {a, b} = c
    case Syntax.Identifier:
      rightSideIdentifier.call(this, node, node.right);
      break;
  }
}

module.exports = rewriteObjectPattern;
