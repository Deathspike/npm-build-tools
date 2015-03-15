'use strict';
var Command = require('commander').Command;
var each = require('./utilities/each');
var fs = require('fs');
var path = require('path');

/**
 * ...
 * @param {({args: Array.<string>}|Array.<string>|string)=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  var options = input || parse(process.argv);
  each(options.args || options, function(directoryPath, next) {
    clean(directoryPath, true, next);
  }, function(err) {
    if (err) return (done || console.error)(err);
    if (done) done();
  });
};

/**
 * Cleans the files and directories in the directory path.
 * @param {string} directoryPath
 * @param {function(Error=)} done
 */
function clean(directoryPath, isRoot, done) {
  fs.readdir(directoryPath, function(err, relativePaths) {
    if (err) return done(isRoot ? undefined : err);
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
}

/**
 * Parses the arguments into a set of options.
 * @param {Array.<string>} args
 * @returns {Object}
 */
function parse(args) {
  return new Command().version(require('../package').version).parse(args);
}

if (module === require.main) {
  module.exports();
}
