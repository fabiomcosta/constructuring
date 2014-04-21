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
      // NOTE: is the first element from a function body always the block
      // statement or do we have to look for the first one?
      var body = node.body.body || node.body;
      body.unshift(
        b.variableDeclaration('var', [b.variableDeclarator(param, id)])
      );
    }
  }
}

module.exports = rewriteFunctionNode;
