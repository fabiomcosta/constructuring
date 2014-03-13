/* jshint esnext:true */
'strict mode';

var assert = require('chai').assert;
var transform = require('../index').transform;


var supportsDestructuring = (function() {
  try {
    eval('"strict mode"; var [a] = [1];');
  } catch (e) {
    if (e instanceof SyntaxError) {
      return false;
    }
  }
  return true;
}());

function sanitizeSource(src) {
  src = src.replace(/[\n\t ]+/g, ' ');
  src = src.replace(/\[\s+/g, '['); // remove space inside [. [ 1] -> [1]
  src = src.replace(/\s+\]/g, ']'); // remove space inside ]. [1 ] -> [1]
  return src.trim();
}

function makeSrc(fn) {
  if (typeof fn === 'string') {
    return fn;
  }
  var src = String(fn).trim();
  src = src.replace(/^function[^(]*\([^)]*\)\s*{/, '');
  src = src.replace(/}$/, '');
  return sanitizeSource(src);
}

function assertSrcEquals(referenceFn, compareFn) {
  var codegenOptions = {format: {newline: ' ', indent: {style: ''}}};
  var referenceSrc = makeSrc(referenceFn);
  var transformedReferenceSrc = sanitizeSource(transform(referenceSrc, codegenOptions));
  var compareSrc = makeSrc(compareFn);
  assert.strictEqual(transformedReferenceSrc, compareSrc);
  return {
    andAssert: function(assertFn) {
      var assertSrc = makeSrc(assertFn);
      if (supportsDestructuring) {
        assert(
          eval(referenceSrc + assertSrc),
          '"' + referenceSrc + '" did not pass the assert test "' + assertSrc + '"'
        );
      }
      assert(
        eval(compareSrc + assertSrc),
        '"' + compareSrc + '" did not pass the assert test "' + assertSrc + '"'
      );
    },
    checkThrows: function(errorType, message) {
      var refThrew = true;
      if (supportsDestructuring) {
        refThrew = false;
        try {
          eval(referenceSrc);
        } catch(e) {
          refThrew = true;
          assert(
            e instanceof errorType,
            '"' + referenceSrc + '" did not throw "' + errorType + '"'
          );
        }
        // TODO should we also check for the same message on the
        // reference source?
      }
      var compThrew = false;
      try {
        eval(compareSrc);
      } catch(e) {
        compThrew = true;
        assert(
          e instanceof errorType,
          '"' + compareSrc + '" did not throw "' + errorType + '"'
        );
        if (message) {
          assert.strictEqual(String(e), message);
        }
      }
      assert(
        refThrew && compThrew,
        '"' + errorType + '" wasn\'t thrown'
      );
    }
  };
}

module.exports = {
  assertSrcEquals: assertSrcEquals,
  makeSrc: makeSrc
};
