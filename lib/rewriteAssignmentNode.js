/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

var DeclarationWrapper = require('./DeclarationWrapper');
var rewriteArrayPattern = require('./rewriteArrayPattern');
var rewriteObjectPattern = require('./rewriteObjectPattern');
var traverse = require('./traverse');
var utils = require('./utils');
var p = utils.p, log = utils.log;


function rewriteAssignmentNode(getId) {
  var node = new DeclarationWrapper(this);

  if (!node.left || !node.right) {
    return;
  }

  if (n.ArrayPattern.check(node.left) || n.ObjectPattern.check(node.left)) {
    if (n.ArrayPattern.check(node.left)) {
      rewriteArrayPattern.call(this, node, getId);
    } else if (n.ObjectPattern.check(node.left)) {
      rewriteObjectPattern.call(this, node, getId);
    }

    // Recursively transforms other assignments.
    // For nested ArrayPatterns for example.
    this.replace.apply(this, node.getNodes());
  }
}

module.exports = rewriteAssignmentNode;
