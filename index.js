#!/usr/bin/env node --harmony
/* jshint esnext:true, eqnull:true */
'strict mode';

var esprima = require('esprima');
var escodegen = require('escodegen');
var types = require('ast-types');

var getIdCreator = require('./lib/getIdCreator');
var traverse = require('./lib/traverse');
var utils = require('./lib/utils');
var p = utils.p, log = utils.log;


function transform(ast, options) {
  options = options || {};
  var getId = getIdCreator(options.idPrefix);
  var result = types.traverse(ast, function() {
    traverse.call(this, getId);
  });
  return result;
}

var codegenDefaultOptions ={
  moz: {
    parenthesizedComprehensionBlock: true,
    comprehensionExpressionStartsWithAssignment: true
  }
};

function transformSource(source, transformOptions, codegenOptions) {
  var ast = esprima.parse(source);
  codegenOptions = codegenOptions || codegenDefaultOptions;
  return escodegen.generate(transform(ast, transformOptions), codegenOptions);
}

module.exports = {
  transform: transform,
  transformSource: transformSource
};
