/* jshint esnext:true */
'strict mode';

var escope = require('escope');

// Takes an AST with mozilla's format, from esprima for example
var UUIDCreator = function(ast) {
  this.scopeManager = escope.analyze(ast);
  this.resetState();
};
UUIDCreator.prototype.resetState = function() {
  this._ids = [];
  this._inc = 0;
  this._identifierPrefix = '_$$';
};
UUIDCreator.prototype.isUsedIdentifier = function(name) {
  return this.scopeManager.scopes.some(function(scope) {
    return scope.isUsedName(name);
  });
};
UUIDCreator.prototype.get = function() {
  while (true) {
    var name = this._identifierPrefix + this._inc;
    this._inc++;
    if (!this.isUsedIdentifier(name)) {
      return name;
    }
  }
  throw new Error('This error should never be seen, there is something ' +
                  'really nasty happening and no UUID could be generated.');
};
// Returns a function that creates uuids for temporary use.
// The benefit of this is that the generated ids can be reused by future
// instances of this same class.
UUIDCreator.prototype.getTemporaryUUIDCreator = function() {
  var index = 0;
  return function() {
    var id = this._ids[index];
    if (!id) {
      id = this.get();
      this._ids[index] = id;
    }
    index++;
    return id;
  }.bind(this);
};

module.exports = UUIDCreator;
