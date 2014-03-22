/* jshint esnext:true */
'strict mode';

var assert = require('better-assert');
var assertSrcEquals = require('./helpers').assertSrcEquals;


describe('Destructuring Array', function() {
  it('should destruct 1 variable', function() {
    assertSrcEquals(
      function() {
        [a] = [1];
      },
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
      'var [a] = [1];',
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
      function() {
        [a, b] = [1, 2];
      },
      function() {
        a = 1, b = 2;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct 2 variable with var', function() {
    assertSrcEquals(
      'var [a, b] = [1, 2];',
      function() {
        var a = 1, b = 2;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct when the right array is bigger', function() {
    assertSrcEquals(
      function() {
        [a, b] = [1, 2, 3];
      },
      function() {
        a = 1, b = 2;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct when the right array is bigger with var', function() {
    assertSrcEquals(
      'var [a, b] = [1, 2, 3];',
      function() {
        var a = 1, b = 2;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it.skip('should destruct when the left array is bigger', function() {
    assertSrcEquals(
      function() {
        [a, b, c] = [1, 2];
      },
      // The last value becomes undefined (Firefox 29.0a2 (2014-03-09))
      function() {
        var _$$0 = [1, 2];
        a = 1, b = 2, c = _$$0[2];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === [][0];
      }
    );
  });
  it('should destruct when the left array is bigger with var', function() {
    assertSrcEquals(
      'var [a, b, c] = [1, 2];',
      // The last value becomes undefined (Firefox 29.0a2 (2014-03-09))
      function() {
        var a = 1, b = 2, c = undefined;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === [][0];
      }
    );
  });
  it('should destruct when there are missing elements on the left array',
     function() {
    assertSrcEquals(
      function() {
        [,a] = [1, 2];
      },
      function() {
        a = 2;
      }
    ).andAssert(
      function() {
        a === 2;
      }
    );
  });
  it('should destruct when there are missing elements on the left array ' +
     'with var', function() {
    assertSrcEquals(
      'var [,a] = [1, 2];',
      function() {
        var a = 2;
      }
    ).andAssert(
      function() {
        a === 2;
      }
    );
  });
  it('should destruct when there are missing elements in the middle of ' +
     'the left array', function() {
    assertSrcEquals(
      function() {
        [,a,,b,,,c] = [1, 2, 3, 4, 5];
      },
      function() {
        a = 2, b = 4, c = undefined;
      }
    ).andAssert(
      function() {
        a === 2 && b === 4 && c === 0[0];
      }
    );
  });
  it('should destruct when there are missing elements in the middle of ' +
     'the left array with var', function() {
    assertSrcEquals(
      'var [,a,,b,,,c] = [1, 2, 3, 4, 5];',
      function() {
        var a = 2, b = 4, c = undefined;
      }
    ).andAssert(
      function() {
        a === 2 && b === 4 && c === 0[0];
      }
    );
  });
  it('should destruct when there are missing elements in the middle of ' +
     'the right array', function() {
    assertSrcEquals(
      function() {
        [a, b, c] = [,1,,4];
      },
      function() {
        a = undefined, b = 1, c = undefined;
      }
    ).andAssert(
      function() {
        a === [][0] && b === 1 && c === [][0];
      }
    );
  });
  it('should destruct when there are missing elements in the middle of ' +
     'the right array with var', function() {
    assertSrcEquals(
      'var [a, b, c] = [,1,,4];',
      function() {
        var a = undefined, b = 1, c = undefined;
      }
    ).andAssert(
      function() {
        a === [][0] && b === 1 && c === [][0];
      }
    );
  });
  it('should destruct when there are identifiers on the right array',
     function() {
    assertSrcEquals(
      function() {
        var d = 1, e = 2, f = 3;
        [a, b, c] = [d, e, f];
      },
      function() {
        var d = 1, e = 2, f = 3;
        a = d, b = e, c = f;
      }
    ).andAssert(
      function() {
        d === 1 && e === 2 && f === 3 && a === d && b === e && c === f;
      }
    );
  });
  it('should destruct when there are identifiers on the right array with var',
     function() {
    assertSrcEquals(
      'var d = 1, e = 2, f = 3;' +
      'var [a, b, c] = [d, e, f];',
      function() {
        var d = 1, e = 2, f = 3;
        var a = d, b = e, c = f;
      }
    ).andAssert(
      function() {
        d === 1 && e === 2 && f === 3 && a === d && b === e && c === f;
      }
    );
  });
  it('should destruct when there are identifiers on the right array, ' +
     'swapping values', function() {
    assertSrcEquals(
      function() {
        var a = 1, b = 2;
        [a, b] = [b, a];
      },
      function() {
        var a = 1, b = 2, _$$0 = a;
        a = b, b = _$$0;
      }
    ).andAssert(
      function() {
        a === 2 && b === 1;
      }
    );
  });
  it('should destruct when there are identifiers on the right array, ' +
     'swapping values with var', function() {
    assertSrcEquals(
      'var a = 1, b = 2;' +
      'var [a, b] = [b, a];',
      function() {
        var a = 1, b = 2;
        var _$$0 = a, a = b, b = _$$0;
      }
    ).andAssert(
      function() {
        a === 2 && b === 1;
      }
    );
  });
  it('should destruct when there are identifiers on the right array, ' +
     'swapping more than one value', function() {
    assertSrcEquals(
      function() {
        var a = 1, b = 2, c = 3;
        [a, b, c] = [c, a, b];
      },
      function() {
        var a = 1, b = 2, c = 3, _$$0 = a, _$$1 = b;
        a = c, b = _$$0, c = _$$1;
      }
    ).andAssert(
      function() {
        a === 3 && b === 1 && c === 2;
      }
    );
  });
  it('should destruct when there are identifiers on the right array, ' +
     'swapping more than one value with var', function() {
    assertSrcEquals(
      'var a = 1, b = 2, c = 3;' +
      'var [a, b, c] = [c, a, b];',
      function() {
        var a = 1, b = 2, c = 3;
        var _$$0 = a, _$$1 = b, a = c, b = _$$0, c = _$$1;
      }
    ).andAssert(
      function() {
        a === 3 && b === 1 && c === 2;
      }
    );
  });
  it('should destruct nested arrays', function() {
    assertSrcEquals(
      function() {
        [a, [b, c]] = [1, [2, 3]];
      },
      function() {
        a = 1, b = 2, c = 3;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3;
      }
    );
  });
  it('should destruct nested arrays with var', function() {
    assertSrcEquals(
      'var [a, [b, c]] = [1, [2, 3]];',
      function() {
        var a = 1, b = 2, c = 3;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3;
      }
    );
  });
  it('should destruct nested arrays with repeated values', function() {
    assertSrcEquals(
      function() {
        [a, [a, b]] = [1, [2, 3]];
      },
      // TODO: ideally it would be only "a = 2, b = 3" right?
      // This is a very edge case so I'm not sure it's worth the time
      function() {
        a = 1, a = 2, b = 3;
      }
    ).andAssert(
      function() {
        a === 2 && b === 3;
      }
    );
  });
  it('should destruct nested arrays with repeated values with var', function() {
    assertSrcEquals(
      'var [a, [a, b]] = [1, [2, 3]];',
      // TODO: ideally it would be only "var a = 2, b = 3" right?
      // This is a very edge case so I'm not sure it's worth the time
      function() {
        var a = 1, a = 2, b = 3;
      }
    ).andAssert(
      function() {
        a === 2 && b === 3;
      }
    );
  });
  it('should destruct when there is an idenfier on the right', function() {
    assertSrcEquals(
      function() {
        var c = [1, 2];
        [a, b] = c;
      },
      function() {
        var c = [1, 2];
        a = c[0], b = c[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct when there is an idenfier on the right with var',
     function() {
    assertSrcEquals(
      'var c = [1, 2];' +
      'var [a, b] = c;',
      function() {
        var c = [1, 2];
        var a = c[0], b = c[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct when there is a function call on the right', function() {
    assertSrcEquals(
      function() {
        var c = function () { return [, 1]; };
        [a, b] = c();
      },
      function() {
        var c = function () { return [, 1]; }, _$$0 = c();
        a = _$$0[0], b = _$$0[1];
      }
    ).andAssert(
      function() {
        a === [][0] && b === 1;
      }
    );
  });
  it('should destruct when there is a function call on the right with var', function() {
    assertSrcEquals(
      'var c = function () { return [, 1]; };' +
      'var [a, b] = c();',
      function() {
        var c = function () { return [, 1]; };
        var _$$0 = c(), a = _$$0[0], b = _$$0[1];
      }
    ).andAssert(
      function() {
        a === [][0] && b === 1;
      }
    );
  });
  it('should destruct when there is a function call inside the array on the ' +
     'right', function() {
    assertSrcEquals(
      function() {
        var d = function () { return [, 1]; };
        [[a, b], c] = [d(), 3];
      },
      function() {
        var d = function () { return [, 1]; }, _$$0 = d();
        a = _$$0[0], b = _$$0[1], c = 3;
      }
    ).andAssert(
      function() {
        a === [][0] && b === 1 && c === 3;
      }
    );
  });
  it('should destruct when there is a function call inside the array on the ' +
     'right with var', function() {
    assertSrcEquals(
      'var d = function () { return [, 1]; };' +
      'var [[a, b], c] = [d(), 3];',
      function() {
        var d = function () { return [, 1]; };
        var _$$0 = d(), a = _$$0[0], b = _$$0[1], c = 3;
      }
    ).andAssert(
      function() {
        a === [][0] && b === 1 && c === 3;
      }
    );
  });
  it('should destruct nested array with identifier on the right', function() {
    assertSrcEquals(
      function() {
        var d = [1, 2];
        [[a, b], c] = [d, 3];
      },
      function() {
        var d = [1, 2];
        a = d[0], b = d[1], c = 3;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3;
      }
    );
  });
  it('should destruct nested array with identifier on the right with var',
     function() {
    assertSrcEquals(
      'var d = [1, 2];' +
      'var [[a, b], c] = [d, 3];',
      function() {
        var d = [1, 2];
        var a = d[0], b = d[1], c = 3;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3;
      }
    );
  });
  // The values on the array pattern become undefined (Firefox 29.0a2 (2014-03-09))
  it('should destruct weird case with literal on the right', function() {
    assertSrcEquals(
      function() {
        [a, b] = 1;
      },
      function() {
        var _$$0 = 1;
        a = _$$0[0], b = _$$0[1];
      }
    ).andAssert(
      function() {
        a === [][0] && b === [][0];
      }
    );
  });
  it('should destruct weird case with literal on the right making sure ' +
     'the right value is set to the element that dont match', function() {
    // Adding this value to the prototype to test that the end result
    // will actually get the array's '2' property.
    String.prototype[2] = 33;
    assertSrcEquals(
      function() {
        [a, b, c] = 'fa';
      },
      // c becomes 33 (Firefox 29.0a2 (2014-03-09))
      function() {
        var _$$0 = 'fa';
        a = _$$0[0], b = _$$0[1], c = _$$0[2];
      }
    ).andAssert(
      function() {
        a === 'f' && b === 'a' && c === 33;
      }
    );
    delete String.prototype[2];
  });
  it('should destruct weird case with literal on the right making sure ' +
    'the right value is set to the element that dont match with var',
  function() {
    // Adding this value to the prototype to test that the end result
    // will actually get the array's '2' property.
    String.prototype[2] = 33;
    assertSrcEquals(
      "var [a, b, c] = 'fa';",
      // c becomes 33 (Firefox 29.0a2 (2014-03-09))
      function() {
        var _$$0 = 'fa', a = _$$0[0], b = _$$0[1], c = _$$0[2];
      }
    ).andAssert(
      function() {
        a === 'f' && b === 'a' && c === 33;
      }
    );
    delete String.prototype[2];
  });
  // The values on the array pattern become undefined (Firefox 29.0a2 (2014-03-09))
  it('should destruct weird case with literal on the right with var', function() {
    assertSrcEquals(
      'var [a, b] = 1;',
      function() {
        var _$$0 = 1, a = _$$0[0], b = _$$0[1];
      }
    ).andAssert(
      function() {
        a === [][0] && b === [][0];
      }
    );
  });
  it('should destruct weird case with function call on the right that ' +
     'returns a literal', function() {
    assertSrcEquals(
      function() {
        var c = function () { return 1; };
        [a, b] = c();
      },
      function() {
        var c = function () { return 1; }, _$$0 = c();
        a = _$$0[0], b = _$$0[1];
      }
    ).andAssert(
      function() {
        a === [][0] && b === [][0];
      }
    );
  });
  it('should destruct weird case with function call on the right that ' +
     'returns a literal wih var', function() {
    assertSrcEquals(
      'var c = function () { return 1; };' +
      'var [a, b] = c();',
      function() {
        var c = function () { return 1; };
        var _$$0 = c(), a = _$$0[0], b = _$$0[1];
      }
    ).andAssert(
      function() {
        a === [][0] && b === [][0];
      }
    );
  });
  // An error is thrown (Firefox 29.0a2 (2014-03-09))
  it('should destruct weird case with function call on the right that ' +
     'returns null', function() {
    assertSrcEquals(
      function() {
        var c = function () { return null; };
        [a, b] = c();
      },
      function() {
        var c = function () { return null; }, _$$0 = c();
        a = _$$0[0], b = _$$0[1];
      }
    ).checkThrows(
      TypeError,
      'TypeError: Cannot read property \'0\' of null'
    );
  });
  // An error is thrown (Firefox 29.0a2 (2014-03-09))
  it('should destruct weird case with function call on the right that ' +
     'returns null with var', function() {
    assertSrcEquals(
      'var c = function () { return null; };' +
      'var [a, b] = c();',
      function() {
        var c = function () { return null; };
        var _$$0 = c(), a = _$$0[0], b = _$$0[1];
      }
    ).checkThrows(
      TypeError,
      'TypeError: Cannot read property \'0\' of null'
    );
  });
  it('should destruct complex nested sequence expression', function() {
    assertSrcEquals(
      function() {
        var f = [1, 2], h = [8];
        var i = function () { return; };
        [[a, b], c, [d, e]] = [f, i(), [,5]], [g] = h;
      },
      function() {
        var f = [1, 2], h = [8];
        var i = function () { return; };
        a = f[0], b = f[1], c = i(), d = undefined, e = 5, g = h[0];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === [][0] && d === [][0] && e ===5 && g === 8;
      }
    );
  });
  it('should destruct complex nested sequence expression with var',
     function() {
    assertSrcEquals(
      'var f = [1, 2], h = [8];' +
      'var i = function () { return; };' +
      'var [[a, b], c, [d, e]] = [f, i(), [,5]], [g] = h;',
      function() {
        var f = [1, 2], h = [8];
        var i = function () { return; };
        var a = f[0], b = f[1], c = i(), d = undefined, e = 5, g = h[0];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === [][0] && d === [][0] && e ===5 && g === 8;
      }
    );
  });
  it('should destruct more than one assignment expression', function() {
    assertSrcEquals(
      function() {
        var f = function () { return [1, 2]; };
        function garbage() {}
        [a, b] = f();
        [c, d] = f();
      },
      function() {
        var f = function () { return [1, 2]; };
        function garbage() { }
        var _$$0 = f(), _$$1 = f();
        a = _$$0[0], b = _$$0[1];
        c = _$$1[0], d = _$$1[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 1 && d === 2;
      }
    );
  });
  it('should destruct more than one assignment expression with var',
     function() {
    assertSrcEquals(
      'var f = function () { return [1, 2]; };' +
      'function garbage() {}' +
      'var [a, b] = f();' +
      'var [c, d] = f();',
      function() {
        var f = function () { return [1, 2]; };
        function garbage() { }
        var _$$0 = f(), a = _$$0[0], b = _$$0[1];
        var _$$1 = f(), c = _$$1[0], d = _$$1[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 1 && d === 2;
      }
    );
  });
});

