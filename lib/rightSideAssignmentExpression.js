/* jshint esnext:true, eqnull:true */
'strict mode';

var types = require('ast-types');
var n = types.namedTypes;


function rightSideAssignmentExpression(getId) {
  var right = this.get(
    (n.VariableDeclarator.check(this.node) ? 'init' : 'right')
  );
  // ugly way of avoiding cyclic dependency between modules :/
  var replacementExpressions =
    require('./rewriteAssignmentNode').call(right, getId);
  if (replacementExpressions.length !== 1) {
    throw new Error(
      'Why is the replacemenent array bigger than one?'
    );
  }
  var replacementExpression = replacementExpressions[0];
  if (!n.SequenceExpression.check(replacementExpression)) {
    throw new Error(
      'Something unexpected happened, why isn\'t this a ' +
      'SequenceExpression?'
    );
  }
  return replacementExpression;
}

module.exports = rightSideAssignmentExpression;
