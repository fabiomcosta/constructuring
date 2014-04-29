/* jshint esnext:true */
'strict mode';

var _helpers = require('./helpers');
var assertSrcEquals = _helpers.assertSrcEquals;
var getComment = _helpers.getComment;


describe('Destructuring Function Arguments', function() {
  it('should destruct function arguments', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a, b] = function ([c, d]) {
          var garbage = 88;
          return [c, d];
        }([1, 2]);
      */}),
      function() {
        var $0 = function ($1) {
          var c = $1[0], d = $1[1];
          var garbage = 88;
          return [c, d];
        }([1, 2]), a = $0[0], b = $0[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct function arguments nested', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a, b] = function ([c, [d, e]]) {
          return [c, d];
        }([1, 2]);
      */}),
      function() {
        var $0 = function ($1) {
          var c = $1[0], $2 = $1[1], d = $2[0], e = $2[1];
          return [c, d];
        }([1, 2]), a = $0[0], b = $0[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === [][0];
      }
    );
  });
  it('should destruct making sure `arguments` is correct', function() {
    assertSrcEquals(
      getComment(function() {/*
        var a = function ([b, c]) {
          return arguments;
        }([1, 2]);
      */}),
      function() {
        var a = function ($0) {
          var b = $0[0], c = $0[1];
          return arguments;
        }([1, 2]);
      }
    ).andAssert(
      function() {
        a[0][0] === 1 && a[0][1] === 2;
      }
    );
  });
  it('should destruct function arguments with ObjectsPatterns', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a, b] = function ({c, d}) {
          return [c, d];
        }({c: 1, d: 2});
      */}),
      function() {
        var $0 = function ($1) {
          var c = $1.c, d = $1.d;
          return [c, d];
        }({c: 1, d: 2}), a = $0[0], b = $0[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct arguments from ArrowFunctionExpression',
      function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a, b] = (({c, d}) => [c, d])({c: 1, d: 2});
      */}),
      getComment(function() {/*
        var $0 = ($1 => {
          var c = $1.c, d = $1.d;
          return [c, d];
        })({c: 1, d: 2}), a = $0[0], b = $0[1];
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
});
