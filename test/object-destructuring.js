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
      // ideally a = 1;
      function() {
        var $0; $0 = {a: 1}, a = $0.a, $0;
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
      // ideally var a = 1;
      function() {
        var $0 = {a: 1}, a = $0.a;
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
      // ideally a = 1, b = 2;
      function() {
        var $0; $0 = {a: 1, b: 2}, a = $0.a, b = $0.b, $0;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });

  it('should destruct 2 variables with var', function() {
    assertSrcEquals(
      getComment(function() {/*
        var {a, b} = {a: 1, b: 2};
      */}),
      // ideally var a = 1, b = 2;
      function() {
        var $0 = {a: 1, b: 2}, a = $0.a, b = $0.b;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });

  it('should destruct and evaluate the expression to the right value',
     function() {
    assertSrcEquals(
      getComment(function() {/*
        ({c, d}) = ({a, b}) = {a: 1, b: 2, c: 3, d: 4};
      */}),
      function() {
        var $0, $1;
        $1 = ($0 = {a: 1, b: 2, c: 3, d: 4}, a = $0.a, b = $0.b, $0),
          c = $1.c, d = $1.d, $1;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3 && d === 4;
      }
    );
  });

  it('should destruct and evaluate the expression to the right value with var',
     function() {
    assertSrcEquals(
      getComment(function() {/*
        var {b} = {a} = {a: 1, b: 2};
      */}),
      // ideally for readability
      // var $0, $1 = ($0 = {a: 1, b: 2}, a = $0.a, $0), b = $1.b;
      function() {
        var $1 = ($0 = {a: 1, b: 2}, a = $0.a, $0), b = $1.b, $0;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3 && d === 4;
      }
    );
  });

  it('should destruct with a yield on the right',
     function() {
    assertSrcEquals(
      getComment(function() {/*
        var c = function* (b) {
          var {a, b} = yield b;
          return {a: a, b: b};
        }({a: 1, b: 2}), d = c.next();
      */}),
      function() {
        var c = function* (b) {
          var $0 = yield b, a = $0.a, b = $0.b;
          return {a: a, b: b};
        }({a: 1, b: 2}), d = c.next();
      }
    ).andAssert(
      function() {
        d.value.a === 1 && d.value.b === 2;
      }
    );
  });

});
