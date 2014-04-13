/* jshint esnext:true, eqnull:true */
'strict mode';

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

module.exports = createTemporaryVariableDeclaration;
