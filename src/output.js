'use strict';
var Command = require('commander').Command;
var fs = require('fs');
var make = require('./utilities/make');

/**
 * ...
 * @param {({args: Array.<string>}|string)=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  var options = input || parse(process.argv);
  var destinationPath = [].concat(options.args)[0] || input;
  make(destinationPath, function() {
    var next = done || function(err) { if (err) console.error(err); };
    var writeStream = fs.createWriteStream(destinationPath);
    process.stdin.on('error', next).on('close', next).pipe(writeStream);
  });
};

/**
 * Parses the arguments into a set of options.
 * @param {Array.<string>} args
 * @returns {Object}
 */
function parse(args) {
  return new Command().version(require('./package').version).parse(args);
}

if (module === require.main) {
  module.exports();
}
