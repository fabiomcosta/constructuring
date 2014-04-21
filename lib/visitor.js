/* jshint esnext:true, eqnull:true */
'strict mode';

var n = require('ast-types').namedTypes;

function visitor(getId) {
  var node = this.node;
  if (
    n.VariableDeclarator.check(node) ||
    n.AssignmentExpression.check(node)
  ) {
    // ugly way of avoiding cyclic dependency between modules :/
    return require('./rewriteAssignmentNode').call(this, getId);
  } else if (
    n.FunctionDeclaration.check(node) ||
    n.FunctionExpression.check(node)
  ) {
    // ugly way of avoiding cyclic dependency between modules :/
    return require('./rewriteFunctionNode').call(this, getId);
  }
}

module.exports = visitor;
