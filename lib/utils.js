/* jshint esnext:true */
'strict mode';

var util = require('util');

function log(obj) {
  console.log(util.inspect(obj, {depth: null, colors: true}));
}

function p(obj) {
  console.log('******************');
  log(obj);
  console.log('******************');
}

module.exports = {
  log: log,
  p: p
};
