'use strict';
var cmd = require('./utilities/cmd');
var exit = require('./utilities/exit');
var fs = require('fs');
var make = require('./utilities/make');

/**
 * ...
 * @param {({args: Array.<string>}|string)=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  parse(input, function(err, options) {
    if (err) return exit(err, done);
    var destinationPath = options.args[0];
    make(destinationPath, function() {
      var next = done || exit;
      var writeStream = fs.createWriteStream(destinationPath);
      process.stdin.on('error', next).on('close', next).pipe(writeStream);
    });
  });
};

/**
 * Parses input into options.
 * @param {({args: Array.<string>}|string)=} input
 * @param {function(Error, {args: Array.<string>}=)} done
 */
function parse(input, done) {
  if (input && input.args) return done(undefined, input);
  if (input) done(undefined, {args: [].concat(input)});
  cmd([], done);
}

if (module === require.main) {
  module.exports();
}
