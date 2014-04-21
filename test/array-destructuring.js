/* jshint esnext:true */
'strict mode';

var _helpers = require('./helpers');
var assertSrcEquals = _helpers.assertSrcEquals;
var getComment = _helpers.getComment;


describe('Destructuring Array', function() {
  it('should destruct 1 variable', function() {
    assertSrcEquals(
      function() {
        [a] = [1];
      },
      // ideally a = 1;
      // ^ kinda complicated because you have to make the return
      // value is discarded. (just like all the next Assignment test cases)
      function() {
        var $0; $0 = [1], a = $0[0], $0;
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
      // ideally var a = 1;
      function() {
        var $0 = [1], a = $0[0];
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
      // ideally a = 1, b = 2;
      function() {
        var $0; $0 = [1, 2], a = $0[0], b = $0[1], $0;
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
      // ideally var a = 1, b = 2;
      function() {
        var $0 = [1, 2], a = $0[0], b = $0[1];
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
      // ideally a = 1, b = 2;
      function() {
        var $0; $0 = [1, 2, 3], a = $0[0], b = $0[1], $0;
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
      // ideally var a = 1, b = 2;
      function() {
        var $0 = [1, 2, 3], a = $0[0], b = $0[1];
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
      // According to "Firefox 29.0a2 (2014-03-09)"
      // ideally var $0; $0 = [1, 2], a = 1, b = 2, c = $0[2];
      function() {
        var $0;
        $0 = [1, 2], a = $0[0], b = $0[1], c = $0[2], $0;
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
      // According to "Firefox 29.0a2 (2014-03-09)"
      // ideally var $0 = [1, 2], a = 1, b = 2, c = $0[2];
      function() {
        var $0 = [1, 2], a = $0[0], b = $0[1], c = $0[2];
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
      // ideally a = 2;
      function() {
        var $0; $0 = [1, 2], a = $0[1], $0;
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
      // ideally var a = 2;
      function() {
        var $0 = [1, 2], a = $0[1];
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
      // ideally var $0; $0 = [1, 2, 3, 4, 5], a = 2, b = 4, c = $0[6];
      function() {
        var $0;
        $0 = [1, 2, 3, 4, 5], a = $0[1], b = $0[3], c = $0[6], $0;
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
      // ideally var $0 = [1, 2, 3, 4, 5], a = 2, b = 4, c = $0[6];
      function() {
        var $0 = [1, 2, 3, 4, 5], a = $0[1], b = $0[3], c = $0[6];
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
      // ideally var $0; $0 = [, 1, , 4], a = $0[0], b = 1, c = $0[2];
      function() {
        var $0;
        $0 = [, 1, , 4], a = $0[0], b = $0[1], c = $0[2], $0;
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
      // ideally var $0 = [, 1, , 4], a = $0[0], b = 1, c = $0[2];
      function() {
        var $0 = [, 1, , 4], a = $0[0], b = $0[1], c = $0[2];
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
        var d = 1, e = 2, f = 3, $0;
        $0 = [d, e, f], a = $0[0], b = $0[1], c = $0[2], $0;
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
        var $0 = [d, e, f], a = $0[0], b = $0[1], c = $0[2];
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
        var a = 1, b = 2, $0;
        $0 = [b, a], a = $0[0], b = $0[1], $0;
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
        var $0 = [b, a], a = $0[0], b = $0[1];
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
        var a = 1, b = 2, c = 3, $0;
        $0 = [c, a, b], a = $0[0], b = $0[1], c = $0[2], $0;
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
        var $0 = [c, a, b], a = $0[0], b = $0[1], c = $0[2];
      }
    ).andAssert(
      function() {
        a === 3 && b === 1 && c === 2;
      }
    );
  });
  it('should destruct when there are identifiers on the right array, ' +
     'swapping more than one value on a nested array', function() {
    assertSrcEquals(
      function() {
        var a = 1, b = 2, c = 3;
        [a, [b, c]] = [c, [a, b]];
      },
      // ideally
      // $0 = [c, [a, b]], a = $0[0], $1 = $0[1], b = $1[0], c = $1[1], $0;
      function() {
        var a = 1, b = 2, c = 3, $0, $1;
        $0 = [c, [a, b]], a = $0[0], $1 = $0[1], b = $1[0], c = $1[1], $1, $0;
      }
    ).andAssert(
      function() {
        a === 3 && b === 1 && c === 2;
      }
    );
  });
  it('should destruct when there are identifiers on the right array, ' +
     'swapping more than one value on a nested array with var', function() {
    assertSrcEquals(
      getComment(function() {/*
        var a = 1, b = 2, c = 3;
        var [a, [b, c]] = [c, [a, b]];
      */}),
      function() {
        var a = 1, b = 2, c = 3;
        var $0 = [c, [a, b]], a = $0[0], $1 = $0[1], b = $1[0], c = $1[1];
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
      // ideally
      // var $0, $1;
      // $0 = [1, [2, 3]], a = 1, $1 = $0[1], b = $1[0], c = $1[1];
      function() {
        var $0, $1;
        $0 = [1, [2, 3]], a = $0[0], $1 = $0[1], b = $1[0], c = $1[1], $1, $0;
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
      // ideally var $0 = [1, [2, 3]], a = 1, $1 = $0[1], b = $1[0], c = $1[1];
      function() {
        var $0 = [1, [2, 3]], a = $0[0], $1 = $0[1], b = $1[0], c = $1[1];
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
      // ideally a = 2, b = 3
      function() {
        var $0, $1;
        $0 = [1, [2, 3]], a = $0[0], $1 = $0[1], a = $1[0], b = $1[1], $1, $0;
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
      // ideally var a = 2, b = 3
      function() {
        var $0 = [1, [2, 3]], a = $0[0], $1 = $0[1], a = $1[0], b = $1[1];
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
        a = c[0], b = c[1], c;
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
        var c = function () { return [, 1]; }, $0;
        $0 = c(), a = $0[0], b = $0[1], $0;
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
        var $0 = c(), a = $0[0], b = $0[1];
      }
    ).andAssert(
      function() {
        a === [][0] && b === 1;
      }
    );
  });
  it('should destruct when there is a function call on the right and a ' +
     'missing element on the left', function() {
    assertSrcEquals(
      function() {
        var d = function () { return [, 1]; };
        [a, b,, c] = d();
      },
      function() {
        var d = function () { return [, 1]; }, $0;
        $0 = d(), a = $0[0], b = $0[1], c = $0[3], $0;
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
      // ideally
      // var d = function () { return [, 1]; }, $0, $1;
      // $0 = [d(), 3], $1 = $0[0], a = $1[0], b = $1[1], c = 3;
      function() {
        var d = function () { return [, 1]; }, $0, $1;
        $0 = [d(), 3], $1 = $0[0], a = $1[0], b = $1[1], $1, c = $0[1], $0;
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
      // ideally
      // var d = function () { return [, 1]; };
      // var $0 = [d(), 3], $1 = $0[0], a = $1[0], b = $1[1], c = 3;
      function() {
        var d = function () { return [, 1]; };
        var $0 = [d(), 3], $1 = $0[0], a = $1[0], b = $1[1], c = $0[1];
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
      // ideally
      // var d = [1, 2], $0, $1;
      // $0 = [d, 3], $1 = $0[0], a = $1[0], b = $1[1], c = 3;
      function() {
        var d = [1, 2], $0, $1;
        $0 = [d, 3], $1 = $0[0], a = $1[0], b = $1[1], $1, c = $0[1], $0;
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
      // ideally
      // var d = [1, 2];
      // var $0 = [d, 3], $1 = $0[0], a = $1[0], b = $1[1], c = 3;
      function() {
        var d = [1, 2];
        var $0 = [d, 3], $1 = $0[0], a = $1[0], b = $1[1], c = $0[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 3;
      }
    );
  });
  // According to "Firefox 29.0a2 (2014-03-09)"
  it('should destruct weird case with literal on the right', function() {
    assertSrcEquals(
      function() {
        [a, b] = 1;
      },
      function() {
        var $0;
        $0 = 1, a = $0[0], b = $0[1], $0;
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
        var $0;
        $0 = 'fa', a = $0[0], b = $0[1], c = $0[2], $0;
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
        var $0 = 'fa', a = $0[0], b = $0[1], c = $0[2];
      }
    ).andAssert(
      function() {
        a === 'f' && b === 'a' && c === 33;
      }
    );
    delete String.prototype[2];
  });
  // According to "Firefox 29.0a2 (2014-03-09)"
  it('should destruct weird case with literal on the right with var', function() {
    assertSrcEquals(
      'var [a, b] = 1;',
      function() {
        var $0 = 1, a = $0[0], b = $0[1];
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
        var c = function () { return 1; }, $0;
        $0 = c(), a = $0[0], b = $0[1], $0;
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
        var $0 = c(), a = $0[0], b = $0[1];
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
        var c = function () { return null; }, $0;
        $0 = c(), a = $0[0], b = $0[1], $0;
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
        var $0 = c(), a = $0[0], b = $0[1];
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
        [[a, b], c, [d, e]] = [f, i(), [, 5]], [g] = h;
      },
      // ideally
      // var f = [1, 2], h = [8], $0, $1, $2;
      // var i = function () { return; };
      // $0 = [f, i(), [, 5]], $1 = $0[0], a = $1[0], b = $1[1],
      //   c = $0[1], $2 = $0[2], d = $2[0], e = $2[1], g = h[0];
      function() {
        var f = [1, 2], h = [8], $0, $1, $2;
        var i = function () { return; };
        $0 = [f, i(), [, 5]], $1 = $0[0], a = $1[0], b = $1[1], $1,
          c = $0[1], $2 = $0[2], d = $2[0], e = $2[1], $2, $0, g = h[0], h;
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
      'var [[a, b], c, [d, e]] = [f, i(), [, 5]], [g] = h;',
      function() {
        var f = [1, 2], h = [8];
        var i = function () { return; };
        var $0 = [f, i(), [, 5]], $1 = $0[0], a = $1[0], b = $1[1],
          c = $0[1], $2 = $0[2], d = $2[0], e = $2[1], g = h[0];
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
        var f = function () { return [1, 2]; }, $0, $1;
        function garbage() { }
        $0 = f(), a = $0[0], b = $0[1], $0;
        $1 = f(), c = $1[0], d = $1[1], $1;
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
      getComment(function() {/*
        var f = function () { return [1, 2]; };
        function garbage() {}
        var [a, b] = f();
        var [c, d] = f();
      */}),
      function() {
        var f = function () { return [1, 2]; };
        function garbage() { }
        var $0 = f(), a = $0[0], b = $0[1];
        var $1 = f(), c = $1[0], d = $1[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 1 && d === 2;
      }
    );
  });
  it('should destruct with a yield', function() {
    assertSrcEquals(
      getComment(function() {/*
        var c = function* (b) {
          var [a, b] = yield b;
          return [a, b];
        }([1, 2]), d = c.next();
      */}),
      function() {
        var c = function* (b) {
          var $0 = yield b, a = $0[0], b = $0[1];
          return [a, b];
        }([1, 2]), d = c.next();
      }
    ).andAssert(
      // you'll need node devel for this
      function() {
        d.value[0] === 1 && d.value[1] === 2;
      }
    );
  });
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
          var c = $1[0], d = $1[1], garbage = 88;
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
  it('should destruct inside a loop assignment', function() {
    assertSrcEquals(
      function() {
        var x = [[1, 2], [3, 4]], i = 2, a, b;
        while (i && ([a, b] = x[--i])) { }
      },
      function() {
        var x = [[1, 2], [3, 4]], i = 2, a, b, $0;
        while (i && ($0 = x[--i], a = $0[0], b = $0[1], $0)) { }
      }
    ).andAssert(
      function() {
        a === 1 && b === 2;
      }
    );
  });
  it('should destruct and the resulting expression should return ' +
     'the initial right value', function() {
    assertSrcEquals(
      function() {
        function f() { return [1, 2]; } ;
        c = [a, b] = f(), 3;
      },
      function() {
        var $0;
        function f() { return [1, 2]; } ;
        c = ($0 = f(), a = $0[0], b = $0[1], $0), 3;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c[0] === 1 && c[1] === 2;
      }
    );
  });
  it('should destruct and the resulting expression should return ' +
     'the initial right value without temp var', function() {
    assertSrcEquals(
      function() {
        var d = [1, 2];
        c = [a, b] = d, 3;
      },
      function() {
        var d = [1, 2];
        c = (a = d[0], b = d[1], d), 3;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c[0] === 1 && c[1] === 2;
      }
    );
  });
  it('should destruct and the resulting expression should return ' +
     'initial right value without last value', function() {
    assertSrcEquals(
      function() {
        [c, d] = [a, b] = [1, 2];
      },
      function() {
        var $0, $1;
        $0 = ($1 = [1, 2], a = $1[0], b = $1[1], $1),
          c = $0[0], d = $0[1], $0;
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 1 && d === 2;
      }
    );
  });
  it('should destruct and the resulting expression should return ' +
     'initial right value without last value with var', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [c, d] = [a, b] = [1, 2];
      */}),
      // ideally for readability
      // var $1, $0 = ($1 = [1, 2], a = $1[0], b = $1[1], $1),
      //   c = $0[0], d = $0[1];
      function() {
        var $1;
        var $0 = ($1 = [1, 2], a = $1[0], b = $1[1], $1),
          c = $0[0], d = $0[1];
      }
    ).andAssert(
      function() {
        a === 1 && b === 2 && c === 1 && d === 2;
      }
    );
  });
  it('should destruct and the resulting expression should return ' +
     'the initial right value on a return', function() {
    assertSrcEquals(
      function() {
        var c = function f() {
          var a, b;
          return [a, b] = [1, 2], 3;
        }();
      },
      function() {
        var c = function f() {
          var a, b, $0;
          return $0 = [1, 2], a = $0[0], b = $0[1], $0, 3;
        }();
      }
    ).andAssert(
      function() {
        c === 3;
      }
    );
  });
  it('should destruct NewExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        function Constructor() {};
        Constructor.prototype[0] = 3;
        var [a] = new Constructor();
      */}),
      function() {
        function Constructor() {};
        Constructor.prototype[0] = 3;
        var $0 = new Constructor(), a = $0[0];
      }
    ).andAssert(
      function() {
        a === 3;
      }
    );
  });
  it('should destruct BinaryExpression', function() {
    Boolean.prototype[0] = 12;
    assertSrcEquals(
      getComment(function() {/*
        var [a] = 3 === 3;
      */}),
      function() {
        var $0 = 3 === 3, a = $0[0];
      }
    ).andAssert(
      function() {
        a === 12;
      }
    );
    delete Boolean.prototype[0];
  });
  it('should destruct LogicalExpression', function() {
    Boolean.prototype[0] = 9;
    assertSrcEquals(
      getComment(function() {/*
        var [a] = true && false;
      */}),
      function() {
        var $0 = true && false, a = $0[0];
      }
    ).andAssert(
      function() {
        a === 9;
      }
    );
    delete Boolean.prototype[0];
  });
  it('should destruct ThisExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var b = function () {
          var [a] = this;
          return a;
        }.call([1]);
      */}),
      function() {
        var  b = function () {
          var $0 = this, a = $0[0];
          return a;
        }.call([1]);
      }
    ).andAssert(
      function() {
        b === 1;
      }
    );
  });
  it('should destruct ConditionalExpression', function() {
    Number.prototype[0] = 7;
    assertSrcEquals(
      getComment(function() {/*
        var [a] = true ? 0 : 1;
      */}),
      function() {
        var $0 = true ? 0 : 1, a = $0[0];
      }
    ).andAssert(
      function() {
        a === 7;
      }
    );
    delete Number.prototype[0];
  });
  it('should destruct UpdateExpression', function() {
    Number.prototype[0] = 7;
    assertSrcEquals(
      getComment(function() {/*
        var b = 3, [a] = b++;
      */}),
      function() {
        var b = 3, $0 = b++, a = $0[0];
      }
    ).andAssert(
      function() {
        a === 7;
      }
    );
    delete Number.prototype[0];
  });
  it('should destruct UnaryExpression', function() {
    Number.prototype[0] = 7;
    assertSrcEquals(
      getComment(function() {/*
        var b = 3, [a] = -b;
      */}),
      function() {
        var b = 3, $0 = -b, a = $0[0];
      }
    ).andAssert(
      function() {
        a === 7;
      }
    );
    delete Number.prototype[0];
  });
  it('should destruct ArrowFunctionExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a] = () => 3;
      */}),
      getComment(function() {/*
        var $0 = () => 3, a = $0[0];
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  it('should destruct ComprehensionExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a] = [++x for (x of [1, 2])];
      */}),
      getComment(function() {/*
        var $0 = [++x for (x of [1, 2])], a = $0[0];
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  // escodegen doesn't support ClassExpression yet,
  // but everything should already work
  it.skip('should destruct ClassExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a] = class X{};
      */}),
      getComment(function() {/*
        var $0 = class X{}, a = $0[0];
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  // ast-types doesnt support TemplateLiteral yet
  it.skip('should destruct TemplateLiteral', function() {
    assertSrcEquals(
      getComment(function() {/*
        var [a] = `str`;
      */}),
      getComment(function() {/*
        var $0 = `str`, a = $0[0];
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  // ast-types doesnt support TaggedTemplateExpression yet
  it.skip('should destruct TaggedTemplateExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        function b(){};
        var [a] = b`str`;
      */}),
      getComment(function() {/*
        function b(){};
        var $0 = b`str`, a = $0[0];
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  it.skip('should destruct on `for of` loops considering that a polyfill for ' +
     'Iterables is included', function() {
    assertSrcEquals(
      getComment(function() {/*
        for (var [a, b] of [[1, 2], [3, 4]]) {
        }
      */}),
      function() {
      }
    ).andAssert(
      function() {
      }
    );
  });
});

