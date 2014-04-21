#!/usr/bin/env node --harmony
/* jshint esnext:true, eqnull:true */
'strict mode';

var esprima = require('esprima');
var escodegen = require('escodegen');
var types = require('ast-types');

var getIdCreator = require('./lib/getIdCreator');
var visitor = require('./lib/visitor');
var traverse = require('./lib/traverse');
var utils = require('./lib/utils');
var p = utils.p, log = utils.log;


var codegenDefaultOptions = {
  moz: {
    parenthesizedComprehensionBlock: true,
    comprehensionExpressionStartsWithAssignment: true
  }
};

function transform(ast, options) {
  options = options || {};
  var getId = getIdCreator(options.idPrefix);
  return traverse(ast, function() {
    return visitor.call(this, getId);
  });
}

function transformSource(source, transformOptions, codegenOptions) {
  codegenOptions = codegenOptions || codegenDefaultOptions;
  var ast = esprima.parse(source);
  return escodegen.generate(transform(ast, transformOptions), codegenOptions);
}

module.exports = {
  transform: transform,
  transformSource: transformSource
};
