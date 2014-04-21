/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var utils = require('./utils');
var p = utils.p, log = utils.log;


function rewriteFunctionNode(getId) {
  var node = this.node;
  var params = node.params;

  for (var i = 0; i < params.length; i++) {
    var param = params[i];

    if (n.ArrayPattern.check(param) || n.ObjectPattern.check(param)) {
      var id = params[i] = b.identifier(getId());

      // NOTE: is the first element from a function body always the block
      // statement or do we have to look for the first one?
      var body = node.body.body || node.body;
      var firstNode = body[0];
      var declarations;

      var variableDeclaration = b.variableDeclaration('var', []);
      body.unshift(variableDeclaration);
      declarations = variableDeclaration.declarations;

      var elements;

      if (n.ArrayPattern.check(param)) {
        elements = param.elements.map(function(element, i) {
          return {
            type: Syntax.VariableDeclarator,
            id: element,
            init: b.memberExpression(
              id,
              b.literal(i),
              true // computed
            )
          };
        });
      } else if (n.ObjectPattern.check(param)) {
        elements = param.properties.map(function(property, i) {
          return {
            type: Syntax.VariableDeclarator,
            id: property.key,
            init: b.memberExpression(
              id,
              property.key,
              false // computed
            )
          };
        });
      }
    }

    declarations.unshift.apply(declarations, elements);
  }
}

module.exports = rewriteFunctionNode;
