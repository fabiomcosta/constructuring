/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var utils = require('./utils');
var p = utils.p, log = utils.log;


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
    node.pushDeclaration(leftProperty.key, rightProperty.value);
  }
}

function rewriteObjectPattern(node, getId) {
  switch (node.right.type) {
    // Right is an object. Ex: ({a}) = {a: 1};
    case Syntax.ObjectExpression:
      rightSideObjectExpression.call(this, node, getId);
      break;
  }
}

module.exports = rewriteObjectPattern;
