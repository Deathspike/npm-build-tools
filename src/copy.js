'use strict';
var Command = require('commander').Command;
var each = require('./utilities/each');
var find = require('./utilities/find');
var fs = require('fs');
var make = require('./utilities/make');
var path = require('path');

/**
 * ...
 * @param {{args: Array.<string>, destination: ?string, source: ?string}=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  var options = input || parse(process.argv);
  var destinationPath = options.destination || process.cwd();
  var sourcePath = options.source || process.cwd();
  find(options.args || options, sourcePath, function(err, relativePaths) {
    if (err) return (done || console.error)(err);
    copy(sourcePath, destinationPath, relativePaths, function(err) {
      if (err) return (done || console.error)(err);
      if (done) done();
    });
  });
};

/**
 * Copies files from the source path to the destination path.
 * @param {string} sourcePath
 * @param {string} destinationPath
 * @param {Array.<string>} relativePaths
 * @param {function(Error=)} done
 */
function copy(sourcePath, destinationPath, relativePaths, done) {
  each(relativePaths, function(relativePath, next) {
    var absoluteDestinationPath = path.join(destinationPath, relativePath);
    var absoluteSourcePath = path.resolve(sourcePath, relativePath);
    if (absoluteDestinationPath === absoluteSourcePath) return next();
    make(absoluteDestinationPath, function() {
      var readStream = fs.createReadStream(absoluteSourcePath);
      var writeStream = fs.createWriteStream(absoluteDestinationPath);
      readStream.on('close', next).on('error', next).pipe(writeStream);
    });
  }, done);
}

/**
 * Parses the arguments into a set of options.
 * @param {Array.<string>} args
 * @returns {Object}
 */
function parse(args) {
  return new Command().version(require('../package').version)
    .option('-d, --destination <s>', 'The destination path.')
    .option('-s, --source <s>', 'The source path.')
    .parse(args);
}

if (module === require.main) {
  module.exports();
}
