'use strict';
var each = require('./each');
var glob = require('glob');

/**
 * Finds the files matched by the patterns in the source directory.
 * @param {(Array.<string>|string)} patterns
 * @param {string} sourcePath
 * @param {string=} ignorePatterns
 * @param {function(Error, Array.<string>=)} done
 */
module.exports = function(patterns, sourcePath, ignorePatterns, done) {
  var relativePaths = {};
  if (typeof ignorePatterns === 'function') {
    done = ignorePatterns;
    ignorePatterns = null;
  }
  each(patterns, function(pattern, next) {
    glob(pattern, {cwd: sourcePath, nodir: true, ignore: ignorePatterns}, function(err, foundPaths) {
      if (err) return next(err);
      foundPaths.forEach(function(foundPath) {
        relativePaths[foundPath] = true;
      });
      next();
    });
  }, function(err) {
    if (err) return done(err);
    done(undefined, Object.keys(relativePaths));
  });
};
