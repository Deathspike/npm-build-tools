'use strict';
var cmd = require('./utilities/cmd');
var each = require('./utilities/each');
var exit = require('./utilities/exit');
var find = require('./utilities/find');
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
    var sourcePath = options.source || process.cwd();
    var ignore = options.ignore || null;
    find(options.args, sourcePath, ignore, function(err, relativePaths) {
      if (err) return exit(err, done);
      embed(sourcePath, relativePaths, options.module || 'tml', function(err) {
        if (err) return exit(err, done);
        if (done) done();
      });
    });
  });
};

/**
 * Embed the relative paths in an angular-specific template wrapper.
 * @param {string} sourcePath
 * @param {Array.<string>} relativePaths
 * @param {string} name
 * @param {function(Error=)} done
 */
function embed(sourcePath, relativePaths, name, done) {
  var items = '';
  each(relativePaths, function(relativePath, next) {
    var fullPath = path.join(sourcePath, relativePath);
    fs.readFile(fullPath, 'utf8', function(err, text) {
      if (err) return next(err);
      items += '  $templateCache.put(\'' +
        inline(relativePath) + '\', \'' +
        inline(text.trim()) + '\');\n';
      next();
    });
  }, function(err) {
    if (err) return done(err);
    console.log(
      'angular.module(\'' + inline(name) + '\', []).run([\'$templateCache\', function($templateCache) {\n' +
      items +
      '}]);');
    done();
  });
}

/**
 * Escapes for inline embedding.
 * @param {string} text
 * @returns {string}
 */
function inline(text) {
  var result = '';
  for (var i = 0; i < text.length; i += 1) {
    var value = text.charAt(i);
    if (value === '\'') result += '\\\'';
    else if (value === '\\') result += '\\\\';
    else if (value === '\b') result += '\\b';
    else if (value === '\f') result += '\\f';
    else if (value === '\n') result += '\\n';
    else if (value === '\r') result += '\\r';
    else if (value === '\t') result += '\\t';
    else result += value;
  }
  return result;
}

/**
 * Parses input into options.
 * @param {({args: Array.<string>}|Array.<string>|string)=} input
 * @param {function(Error, {args: Array.<string>}=)} done
 */
function parse(input, done) {
  if (input && input.args) return done(undefined, input);
  if (input) done(undefined, {args: [].concat(input)});
  cmd([
    {option: '-m, --module <s>', text: 'The module name. (Default: tml)'},
    {option: '-s, --source <s>', text: 'The source path.'},
    {option: '-i, --ignore <s>', text: 'Add a pattern or an array of patterns to exclude matches.'}
  ], done);
}

if (module === require.main) {
  module.exports();
}
