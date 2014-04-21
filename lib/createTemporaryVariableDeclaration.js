/* jshint esnext:true, eqnull:true */
'strict mode';

var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var utils = require('./utils');
var p = utils.p, log = utils.log;


function getVariableDeclarationParent(parents) {
  for (var i = 0; i < parents.length; i++) {
    if (n.VariableDeclaration.check(parents[i])) {
      return parents[i];
    }
  }
}

function createTemporaryVariableDeclaration(id, value, node) {
  var temporaryVariableId = b.identifier(id);
  if (!n.VariableDeclarator.check(this.node)) {
    for (var i = 0; i < this.parents.length; i++) {
      var body = this.parents[i].body;
      if (Array.isArray(body)) {
        var tempVar = b.variableDeclarator(temporaryVariableId, null);
        var firstNode = body[0];
        if (!n.VariableDeclaration.check(firstNode)) {
          body.unshift(b.variableDeclaration('var', [tempVar]));
        } else {
          var variableDeclarationParent =
            getVariableDeclarationParent(this.parents);
          if (firstNode === variableDeclarationParent) {
            body.unshift(b.variableDeclaration('var', [tempVar]));
          } else {
            firstNode.declarations.push(tempVar);
          }
        }
        break;
      }
    }
  }
  node.unshiftDeclaration(temporaryVariableId, value);
  return temporaryVariableId;
}

module.exports = createTemporaryVariableDeclaration;
