/* jshint esnext:true */
'strict mode';

var _helpers = require('./helpers');
var assertSrcEquals = _helpers.assertSrcEquals;
var getComment = _helpers.getComment;


describe('Destructuring Object', function() {

  it('should destruct 1 variable', function() {
    assertSrcEquals(
      getComment(function() {/*
        ({a}) = {a: 1};
      */}),
      function() {
        a = 1;
      }
    ).andAssert(
      function() {
        a === 1;
      }
    );
  });

  it('should destruct 1 variable with var', function() {
    assertSrcEquals(
      getComment(function() {/*
        var {a} = {a: 1};
      */}),
      function() {
        var a = 1;
      }
    ).andAssert(
      function() {
        a === 1;
      }
    );
  });

  it('should destruct 2 variables', function() {
    assertSrcEquals(
      getComment(function() {/*
        ({a, b}) = {a: 1, b: 2};
      */}),
      function() {
        a = 1, b = 2;
      }
    ).andAssert(
      function() {
        a === 1;
      }
    );
  });

  it('should destruct 2 variables with var', function() {
    assertSrcEquals(
      getComment(function() {/*
        var {a, b} = {a: 1, b: 2};
      */}),
      function() {
        var a = 1, b = 2;
      }
    ).andAssert(
      function() {
        a === 1;
      }
    );
  });

});
