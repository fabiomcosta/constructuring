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
  it.skip('should destruct 1 variable with var', function() {
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
  it('should destruct when the left array is bigger', function() {
    assertSrcEquals(
      function() {
        [a, b, c] = [1, 2];
      },
      // The last value becomes undefined (Firefox 29.0a2 (2014-03-09))
      function() {
        a = 1, b = 2, c = undefined;
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
  it('should destruct nested arrays', function() {
    assertSrcEquals(
      function() {
        [a, [b, c]] = [1, [2, 3]];
      },
      function() {
        a = 1, (b = 2, c = 3);
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3;
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
  it('should destruct when there is a function call inside the array on the ' +
     'right', function() {
    assertSrcEquals(
      function() {
        var d = function () { return [, 1]; };
        [[a, b], c] = [d(), 3];
      },
      function() {
        var d = function () { return [, 1]; }, _$$0 = d();
        (a = _$$0[0], b = _$$0[1]), c = 3;
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
        (a = d[0], b = d[1]), c = 3;
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
        a = undefined, b = undefined;
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
        ((a = f[0], b = f[1]), c = i(), (d = undefined, e = 5)), (g = h[0]);
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
        var f = function () { return [1, 2]; }, _$$0 = f(), _$$1 = f();
        function garbage() { }
        a = _$$0[0], b = _$$0[1];
        c = _$$1[0], d = _$$1[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 1 && d === 2;
      }
    );
  });
});

