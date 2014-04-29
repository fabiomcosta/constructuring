/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var utils = require('./utils');
var p = utils.p, log = utils.log;


function rewriteFunctionNode(getId) {
  var params = this.node.params;

  for (var i = 0; i < params.length; i++) {
    var param = params[i];

    if (n.ArrayPattern.check(param) || n.ObjectPattern.check(param)) {
      var id = params[i] = b.identifier(getId());
      // The BlockStatement of the funciton
      var body = this.node.body.body;
      // An arrow function might not have a BlockStatement
      var paramVar = b.variableDeclaration('var', [b.variableDeclarator(param, id)]);
      if (!body) {
        var currentBody = this.node.body;
        this.node.body = b.blockStatement([]);
        // TODO make ast-types support initializing a BlockStatement
        // with these values
        this.node.body.body.push(
          paramVar,
          b.returnStatement(currentBody)
        );
        this.node.expression = false;
      } else {
        body.unshift(paramVar);
      }
    }
  }
}

module.exports = rewriteFunctionNode;
