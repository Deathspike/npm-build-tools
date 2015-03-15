'use strict';
var Command = require('commander').Command;
var each = require('./utilities/each');
var find = require('./utilities/find');
var fs = require('fs');
var path = require('path');

/**
 * ...
 * @param {({args: Array.<string>, source: ?string)}|Array.<string>|string)=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  var options = input || parse(process.argv);
  var sourcePath = options.source || process.cwd(); 
  find(options.args || options, process.cwd(), function(err, relativePaths) {
    if (err) return (done || console.error)(err);
    concat(sourcePath, relativePaths, function(err, result) {
      if (err) return (done || console.error)(err);
      if (done) done();
    });
  });
};

/**
 * Concatenate files from the source path into the standard output.
 * @param {string} sourcePath
 * @param {Array.<string>} relativePaths
 * @param {function(Error=)} done
 */
function concat(sourcePath, relativePaths, done) {
  each(relativePaths, function(relativePath, next) {
    var absoluteSourcePath = path.resolve(sourcePath, relativePath);
    var readStream = fs.createReadStream(absoluteSourcePath);
    readStream.on('close', next).on('error', next).pipe(process.stdout);
  }, done);
}

/**
 * Parses the arguments into a set of options.
 * @param {Array.<string>} args
 * @returns {Object}
 */
function parse(args) {
  return new Command().version(require('./package').version)
    .option('-s, --source <s>', 'The source path.')
    .parse(args);
}

if (module === require.main) {
  module.exports();
}
