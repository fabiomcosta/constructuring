# Constructuring

## About

Constructuring is a node module that transforms Javascript code that uses ES6's
destructuring feature into code that runs on today's browsers.

## Example

Transforming a javascript file.
```js
var transformSource = require('constructuring').transformSource;
var source = fs.readFileSync('module_with_destructuring_code.js');
console.log(transformSource(source));
```

Transforming an esprima AST. This option is prefered when you are doing
more than one transformation on your code.
```js
var transform = require('constructuring').transform;
var esprima = require('esprima');
var escodegen = require('escodegen');

var source = fs.readFileSync('module_with_destructuring_code.js');
var ast = esprima.parse(source);
transform(ast);
// do more transformations on the same ast
console.log(escodegen.generate(ast));
```

## Contributing

### Running tests

Make sure you install [mocha](http://mochajs.org/#installation) then run:

```
mocha
```
