'use strict';
var cmd = require('./utilities/cmd');
var each = require('./utilities/each');
var exit = require('./utilities/exit');
var fs = require('fs');
var path = require('path');

/**
 * ...
 * @param {({args: Array.<string>}|Array.<string>|string)=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  parse(input, function(err, options) {
    if (err) return exit(err, done);
    each(options.args, function(directoryPath, next) {
      clean(directoryPath, true, next);
    }, function(err) {
      if (err) return exit(err, done);
      if (done) done();
    });
  });
};

/**
 * Cleans the files and directories in the directory path.
 * @param {string} directoryPath
 * @param {function(Error=)} done
 */
function clean(directoryPath, isRoot, done) {
  fs.stat(directoryPath, function(err, stat) {
    if (err) return done(isRoot ? undefined : err);
    if (stat.isFile()) return fs.unlink(directoryPath, done);
    fs.readdir(directoryPath, function(err, relativePaths) {
      if (err) return done(err);
      each(relativePaths, function(relativePath, next) {
        var absolutePath = path.join(directoryPath, relativePath);
        fs.stat(absolutePath, function(err, stats) {
          if (err) return next(err);
          if (!stats.isDirectory()) return fs.unlink(absolutePath, next);
          clean(absolutePath, false, next);
        });
      }, function(err) {
        if (err) return done(err);
        fs.rmdir(directoryPath, done);
      });
    });
  });
}

/**
 * Parses input into options.
 * @param {({args: Array.<string>}|Array.<string>|string)=} input
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
