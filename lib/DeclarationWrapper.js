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
  var parent = path.parent.node;

  this._isVarDeclarator = n.VariableDeclarator.check(node);

  // An AssignmentExpression not always has a SequenceExpression as parent
  // lets check this and create one if this is false
  if (!this._isVarDeclarator && !n.SequenceExpression.check(path.parent.node)) {
    parent = this._sequenceExpression = b.sequenceExpression([]);
  }
  this.declarations = parent.declarations || parent.expressions;
  this.left = node.left || node.id;
  this.right = node.right || node.init;
  this._replacements = [];
};
DeclarationWrapper.prototype._getAssignmentFor = function(left, right) {
  // NOTE update this to use ast-types. Make it support ArrayPattern
  // as the 'left' property
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
DeclarationWrapper.prototype.isAlreadyDeclared = function(identifier) {
  var previousDeclarations;
  if (this._sequenceExpression) {
    previousDeclarations = this._sequenceExpression.expressions;
  } else {
    previousDeclarations = this._replacements;
  }
  for (var i = 0; i < previousDeclarations.length; i++) {
    var declaration = previousDeclarations[i];
    var left = declaration.left || declaration.id;
    if (n.Identifier.check(left) && left.name === identifier.name) {
      return true;
    }
  }
  return false;
};
DeclarationWrapper.prototype.addDeclaration = function(left, right) {
  var assignment = this._getAssignmentFor(left, right);
  if (this._sequenceExpression) {
    this._sequenceExpression.expressions.push(assignment);
  } else {
    this._replacements.push(assignment);
  }
  return this;
};
DeclarationWrapper.prototype.getNodes = function() {
  if (this._sequenceExpression) {
    return [this._sequenceExpression];
  }
  return this._replacements;
};

module.exports = DeclarationWrapper;
