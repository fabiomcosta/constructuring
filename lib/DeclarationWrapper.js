/* jshint esnext:true, eqnull:true */
'strict mode';

var esprima = require('esprima');
var Syntax = esprima.Syntax;
var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;


// Wrapper for a VariableDeclaration or SequenceExpression node.
// Since these nodes have different property names this class
// contains a single API for manipulating the similar properties.
// Defines if the wrapper will use a VariableDeclaration or SequenceExpression
// based on `node`.
// This is kind of a dirty class that deals with all the differences
// between these 2 node types.
var DeclarationWrapper = function(path) {
  var node = path.node;
  this._path = path;
  this._isVarDeclarator = n.VariableDeclarator.check(node);
  this._replacements = [];
  // var parent = path.parentPath.node;
  // this.declarations = parent.declarations || parent.expressions;
  this.left = node.left || node.id;
  this.right = node.right || node.init;
};
DeclarationWrapper.prototype._getAssignmentFor = function(left, right) {
  // NOTE update this to use ast-types. Add ArrayPattern support
  // as the 'left' property for ast-types
  if (this._isVarDeclarator) {
    return {
      'type': Syntax.VariableDeclarator,
      'id': left,
      'init': right
    };
  }
  return {
    'type': Syntax.AssignmentExpression,
    'operator': '=',
    'left': left,
    'right': right
  };
};
DeclarationWrapper.prototype.pushDeclaration = function(left, right) {
  var assignment = this._getAssignmentFor(left, right);
  this._replacements.push(assignment);
  return this;
};
DeclarationWrapper.prototype.unshiftDeclaration = function(left, right) {
  var assignment = this._getAssignmentFor(left, right);
  this._replacements.unshift(assignment);
  return this;
};
DeclarationWrapper.prototype.getNodes = function() {
  // An AssignmentExpression not always has a SequenceExpression as parent
  // lets check this and create one if this is false
  if (!this._isVarDeclarator && !n.SequenceExpression.check(this._path.parentPath.node)) {
    return [b.sequenceExpression(this._replacements)];
  }
  return this._replacements;
};

module.exports = DeclarationWrapper;
