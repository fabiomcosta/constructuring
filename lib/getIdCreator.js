/* jshint esnext:true */
'strict mode';

var getIdCreator = function(prefix) {
  var inc = 0;
  prefix = prefix || '$';
  return function() {
    return prefix + (inc++).toString(36);
  };
};

module.exports = getIdCreator;
