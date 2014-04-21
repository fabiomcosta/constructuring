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


var hasOwn = Object.prototype.hasOwnProperty;
var slice = Array.prototype.slice;
var parents = [];

function t(node, visitor) {
  return _t(node, visitor);
}

function _t(node, visitor, parent, name, index) {
  if (node && !hasOwn.call(node, 'type')) {
    return;
  }

  var context = {
    replace: function replace(newNode) {
      var args = slice.call(arguments);
      if (index !== undefined) {
        if (args.length === 1) {
          parent[name][index] = newNode;
        } else {
          parent[name].splice.apply(parent[name], [index, 1].concat(args));
        }
      } else {
        if (args.length !== 1) {
          throw new Error('Can\'t replace this node with more than one node.');
        }
        parent[name] = newNode;
      }
      this.node = node = newNode;
    },
    // TODO Should be frozen
    parents: parents,
    node: node
  };

  visitor.call(context);

  var i;

  // Goes here only when there is a valid replace with more than one element
  if (Array.isArray(node)) {
    for (i = 0; i < node.length; i++) {
      _t(node[i], visitor, parent, prop, index + i);
    }
    return;
  }

  parents.unshift(node);

  for (var prop in node) {
    var propValue = node[prop];
    if (Array.isArray(propValue)) {
      for (i = 0; i < propValue.length; i++) {
        _t(propValue[i], visitor, node, prop, i);
      }
    } else {
      _t(propValue, visitor, node, prop);
    }
  }

  parents.shift();

  return node;
}


var codegenDefaultOptions = {
  moz: {
    parenthesizedComprehensionBlock: true,
    comprehensionExpressionStartsWithAssignment: true
  }
};

function transform(ast, options) {
  options = options || {};
  var getId = getIdCreator(options.idPrefix);
  return t(ast, function() {
    return traverse.call(this, getId);
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
