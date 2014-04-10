/* jshint esnext:true, eqnull:true */
'strict mode';

var Syntax = require('esprima').Syntax;
var types = require('ast-types');
var n = types.namedTypes;


function rightSideAssignmentExpression(getId) {
  // ugly way of avoiding cyclic dependency between modules :/
  // TODO this can be 'init' sometimes
  var replacementExpressions =
    require('./rewriteAssignmentNode').call(this.get('right'), getId);
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
