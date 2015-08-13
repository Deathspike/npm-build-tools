'use strict';
var cmd = require('./utilities/cmd');
var each = require('./utilities/each');
var exit = require('./utilities/exit');
var find = require('./utilities/find');
var fs = require('fs');
var path = require('path');

/**
 * ...
 * @param {({args: Array.<string>, divider?: string, source?: string}|Array.<string>|string)=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  parse(input, function(err, options) {
    if (err) return exit(err, done);
    var sourcePath = options.source || process.cwd();
    var ignore = options.ignore || null;
    find(options.args, sourcePath, ignore, function(err, relativePaths) {
      if (err) return exit(err, done);
      var divider = options.divider || '\n';
      concat(divider, sourcePath, relativePaths, function(err) {
        if (err) return exit(err, done);
        if (done) done();
      });
    });
  });
};

/**
 * Concatenate files from the source path into the standard output.
 * @param {string} divider
 * @param {string} sourcePath
 * @param {Array.<string>} relativePaths
 * @param {function(Error)=} done
 */
function concat(divider, sourcePath, relativePaths, done) {
  var writeDivider = false;
  each(relativePaths, function(relativePath, next) {
    var absoluteSourcePath = path.resolve(sourcePath, relativePath);
    var readStream = fs.createReadStream(absoluteSourcePath);
    if (writeDivider) process.stdout.write(divider);
    writeDivider = true;
    readStream.on('close', next).on('error', next).pipe(process.stdout);
  }, done);
}

/**
 * Parses input into options.
 * @param {({args: Array.<string>, divider?: string, source?: string}|Array.<string>|string)=} input
 * @param {function(Error, {args: Array.<string>, divider?: string, source?: string}=)} done
 */
function parse(input, done) {
  if (input && input.args) return done(undefined, input);
  if (input) done(undefined, {args: [].concat(input)});
  cmd([
    {option: '-d, --divider <s>', text: 'The divider. (Default: \\n)'},
    {option: '-s, --source <s>', text: 'The source path.'},
    {option: '-i, --ignore <s>', text: 'Add a pattern or an array of patterns to exclude matches.'}
  ], done);
}

if (module === require.main) {
  module.exports();
}
