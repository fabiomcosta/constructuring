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
        $0 = ($1 = {a: 1, b: 2, c: 3, d: 4}, a = $1.a, b = $1.b, $1),
          c = $0.c, d = $0.d, $0;
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
      function() {
        var $1;
        var $0 = ($1 = {a: 1, b: 2}, a = $1.a, $1), b = $0.b;
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
  it('should destruct Identifier', function() {
    assertSrcEquals(
      getComment(function() {/*
        var b = {a: 3};
        var {a} = b;
      */}),
      function() {
        var b = {a: 3};
        var a = b.a;
      }
    ).andAssert(
      function() {
        a === 3;
      }
    );
  });
  it('should destruct MemberExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var b = {a: {a: 1}};
        var {a} = b.a;
      */}),
      function() {
        var b = {a: {a: 1}};
        var $0 = b.a, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 1;
      }
    );
  });
  it('should destruct SequenceExpression', function() {
    Number.prototype.a = 8;
    assertSrcEquals(
      getComment(function() {/*
        var {a} = (b = 3);
      */}),
      function() {
        var $0 = b = 3, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 8 && b === 3;
      }
    );
    delete Number.prototype.a;
  });
  it('should destruct Literal', function() {
    Number.prototype.a = 8;
    assertSrcEquals(
      getComment(function() {/*
        var {a} = 1;
      */}),
      function() {
        var $0 = 1, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 8;
      }
    );
    delete Number.prototype.a;
  });
  it('should destruct CallExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        function b() {return {a: 1};};
        var {a} = b();
      */}),
      function() {
        function b() {return {a: 1};};
        var $0 = b(), a = $0.a;
      }
    ).andAssert(
      function() {
        a === 1;
      }
    );
  });
  it('should destruct NewExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        function Constructor() {};
        Constructor.prototype.a = 3;
        var {a} = new Constructor();
      */}),
      function() {
        function Constructor() {};
        Constructor.prototype.a = 3;
        var $0 = new Constructor(), a = $0.a;
      }
    ).andAssert(
      function() {
        a === 3;
      }
    );
  });
  it('should destruct BinaryExpression', function() {
    Boolean.prototype.a = 12;
    assertSrcEquals(
      getComment(function() {/*
        var {a} = 3 === 3;
      */}),
      function() {
        var $0 = 3 === 3, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 12;
      }
    );
    delete Boolean.prototype.a;
  });
  it('should destruct LogicalExpression', function() {
    Boolean.prototype.a = 9;
    assertSrcEquals(
      getComment(function() {/*
        var {a} = true && false;
      */}),
      function() {
        var $0 = true && false, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 9;
      }
    );
    delete Boolean.prototype.a;
  });
  it('should destruct ThisExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var b = function () {
          var {a} = this;
          return a;
        }.call({a: 1});
      */}),
      function() {
        var  b = function () {
          var $0 = this, a = $0.a;
          return a;
        }.call({a: 1});
      }
    ).andAssert(
      function() {
        b === 1;
      }
    );
  });
  it('should destruct ConditionalExpression', function() {
    Number.prototype.a = 7;
    assertSrcEquals(
      getComment(function() {/*
        var {a} = true ? 0 : 1;
      */}),
      function() {
        var $0 = true ? 0 : 1, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 7;
      }
    );
    delete Number.prototype.a;
  });
  it('should destruct UpdateExpression', function() {
    Number.prototype.a = 7;
    assertSrcEquals(
      getComment(function() {/*
        var b = 3, {a} = b++;
      */}),
      function() {
        var b = 3, $0 = b++, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 7;
      }
    );
    delete Number.prototype.a;
  });
  it('should destruct UnaryExpression', function() {
    Number.prototype.a = 7;
    assertSrcEquals(
      getComment(function() {/*
        var b = 3, {a} = -b;
      */}),
      function() {
        var b = 3, $0 = -b, a = $0.a;
      }
    ).andAssert(
      function() {
        a === 7;
      }
    );
    delete Number.prototype.a;
  });
  it('should destruct ArrowFunctionExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var {a} = () => 3;
      */}),
      getComment(function() {/*
        var $0 = () => 3, a = $0.a;
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  it('should destruct ComprehensionExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var {a} = [++x for (x of [1, 2])];
      */}),
      getComment(function() {/*
        var $0 = [++x for (x of [1, 2])], a = $0.a;
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  // escodegen doesn't support ClassExpression yet,
  // but everything should already work
  it.skip('should destruct ClassExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        var {a} = class X{};
      */}),
      getComment(function() {/*
        var $0 = class X{}, a = $0.a;
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  // ast-types doesnt support TemplateLiteral yet
  it.skip('should destruct TemplateLiteral', function() {
    assertSrcEquals(
      getComment(function() {/*
        var {a} = `str`;
      */}),
      getComment(function() {/*
        var $0 = `str`, a = $0.a;
      */})
    );
    // We can't assert yet, Node doesn't support it
  });
  // ast-types doesnt support TaggedTemplateExpression yet
  it.skip('should destruct TaggedTemplateExpression', function() {
    assertSrcEquals(
      getComment(function() {/*
        function b(){};
        var {a} = b`str`;
      */}),
      getComment(function() {/*
        function b(){};
        var $0 = b`str`, a = $0.a;
      */})
    );
    // We can't assert yet, Node doesn't support it
  });

});
