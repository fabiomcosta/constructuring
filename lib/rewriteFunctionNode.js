/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var traverse = require('./traverse');


function rewriteFunctionNode(getId) {
  var node = this.node;
  var params = node.params;
  for (var i = 0; i < params.length; i++) {
    var param = params[i];
    if (n.ArrayPattern.check(param)) {
      var id = b.identifier(getId());
      params[i] = id;

      // NOTE: is the first element from a function body always the block
      // statement or do we have to look for the first one?
      var body = node.body.body || node.body;
      var firstNode = body[0];
      var declarations;

      if (n.VariableDeclaration.check(firstNode)) {
        declarations = firstNode.declarations;
      } else {
        var variableDeclaration = b.variableDeclaration('var', []);
        body.unshift(variableDeclaration);
        declarations = variableDeclaration.declarations;
      }

      var elements = param.elements.map(function(element, i) {
        return {
          'type': Syntax.VariableDeclarator,
          'id': element,
          'init': b.memberExpression(
            id,
            b.literal(i),
            true // computed
          )
        };
      });
      declarations.unshift.apply(declarations, elements);
    }

    types.traverse(
      (node.body.body || node.body)[0],
      function(node) {
        traverse.call(this, getId);
      }
    );
  }
}

module.exports = rewriteFunctionNode;
