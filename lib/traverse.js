/* jshint esnext:true, eqnull:true */
'strict mode';

var hasOwn = Object.prototype.hasOwnProperty;
var slice = Array.prototype.slice;
var _parents;

function traverse(node, visitor) {
  _parents = [];
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
    parents: _parents,
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

  _parents.unshift(node);

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

  _parents.shift();

  return node;
}

module.exports = traverse;
