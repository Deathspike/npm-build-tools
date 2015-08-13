'use strict';
var cmd = require('./utilities/cmd');
var each = require('./utilities/each');
var exit = require('./utilities/exit');
var find = require('./utilities/find');
var fs = require('fs');
var make = require('./utilities/make');
var path = require('path');

/**
 * ...
 * @param {{args: Array.<string>, destination?: string, source?: string}=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  parse(input, function(err, options) {
    if (err) return exit(err, done);
    var destinationPath = options.destination || process.cwd();
    var sourcePath = options.source || process.cwd();
    var ignore = options.ignore || null;
    find(options.args, sourcePath, ignore, function(err, relativePaths) {
      if (err) return exit(err, done);
      copy(sourcePath, destinationPath, relativePaths, function(err) {
        if (err) return exit(err, done);
        if (done) done();
      });
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
 * Parses input into options.
 * @param {{args: Array.<string>, destination?: string, source?: string}=} input
 * @param {function(Error, {args: Array.<string>, destination?: string, source?: string}=)} done
 */
function parse(input, done) {
  if (input && input.args) return done(undefined, input);
  if (input) done(undefined, {args: [].concat(input)});
  cmd([
    {option: '-d, --destination <s>', text: 'The destination path.'},
    {option: '-s, --source <s>', text: 'The source path.'},
    {option: '-i, --ignore <s>', text: 'Add a pattern or an array of patterns to exclude matches.'}
  ], done);
}

if (module === require.main) {
  module.exports();
}
