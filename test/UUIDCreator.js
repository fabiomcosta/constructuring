/* jshint esnext:true */
'strict mode';

var assert = require('better-assert');
var esprima = require('esprima');

var transform = require('../index').transform;
var UUIDCreator = require('../lib/UUIDCreator');
var makeSrc = require('./helpers').makeSrc;


describe('UUIDCreator', function() {
  var testFn = function() {
    var _$$3 = 3;
    (function() {
      'use strict';
      { let _$$1 = 1; }
    }());
  };

  var ast = esprima.parse(makeSrc(testFn));
  var uuidCreator = new UUIDCreator(ast);
  tmpCreator = uuidCreator.getTemporaryUUIDCreator();

  assert(tmpCreator() === '_$$0');
  assert(tmpCreator() === '_$$2');
  assert(tmpCreator() === '_$$4');
});
