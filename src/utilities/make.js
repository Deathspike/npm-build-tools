'use strict';
var each = require('./each');
var fs = require('fs');
var path = require('path');

/**
 * Makes directories for the file path.
 * @param {string} directoryPath
 * @param {function()} done
 */
module.exports = function(filePath, done) {
  var directoryPaths = [];
  var previousPath = path.resolve(filePath);
  while (true) {
    var currentPath = path.join(previousPath, '..');
    if (currentPath === previousPath) break;
    directoryPaths.push(currentPath);
    previousPath = currentPath;
  }
  each(directoryPaths.reverse(), function(directoryPath, next) {
    fs.mkdir(directoryPath, function() {
      next();
    });
  }, done);
};
