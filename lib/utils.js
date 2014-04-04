/* jshint esnext:true */
'strict mode';

var util = require('util');

function log(obj) {
  console.log(util.inspect(obj, {depth: null, colors: true}));
}

function p() {
  console.log('******************');
  for (var i = 0, l = arguments.length; i < l; i ++) {
    log(arguments[i]);
  }
  console.log('******************');
}

module.exports = {
  log: log,
  p: p
};
