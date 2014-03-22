/* jshint esnext:true */
'strict mode';

var assert = require('chai').assert;
var esprima = require('esprima');

var transform = require('../index').transform;
var getIdCreator = require('../lib/getIdCreator');
var makeSrc = require('./helpers').makeSrc;


describe('getIdCreator', function() {
  it('should create simple ids', function() {
    var getId = getIdCreator();
    assert.strictEqual(getId(), '$0');
    assert.strictEqual(getId(), '$1');
    assert.strictEqual(getId(), '$2');
  });
});
