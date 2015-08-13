'use strict';
var Command = require('commander').Command;
var each = require('./each');
var find = require('./find');
var fs = require('fs');

/**
 * Processes command line arguments and expands variables/globs.
 * @param {Array.<{option: string, text: string}>} entries
 * @param {function(Error, {Object.<string, *>}=)} done
 */
module.exports = function(entries, done) {
  var options = loadOptions(entries);
  loadConfig(function(err, config) {
    if (err) return done(err);
    var sourcePath = options.source || process.cwd();
    var ignore = options.ignore || null;
    variables(options.args, config, function(err) {
      if (err) return done(err);
      globs(sourcePath, ignore, options.args, function(err, args) {
        if (err) return done(err);
        options.args = args;
        done(undefined, options);
      });
    });
  });
};

/**
 * Iterates through each command and expands each glob pattern.
 * @param {string} sourcePath
 * @param {Array.<string>} commands
 * @param {function(Error, Array.<string>=)} done
 */
function globs(sourcePath, ignore, commands, done) {
  var expression = /\$g\[(.+?)\]/g;
  var result = [];
  each(commands, function(command, next) {
    var map = {};
    var match;
    var matches = [];
    while ((match = expression.exec(command))) matches.push(match);
    each(matches, function(patternMatch, next) {
      find(patternMatch[1], sourcePath, ignore, function(err, relativePaths) {
        if (err) return next(err);
        map[patternMatch[1]] = relativePaths;
        next();
      });
    }, function(err) {
      if (err) return next(err);
      result.push(command.replace(expression, function(match, matchKey) {
        return map[matchKey].join(' ');
      }));
      next();
    });
  }, function(err) {
    if (err) return done(err);
    done(undefined, result);
  });
}

/**
 * Loads the configuration.
 * @param {function(Error, Object=)}
 */
function loadConfig(done) {
  fs.stat('package.json', function(err) {
    if (err) return done(undefined, {});
    fs.readFile('package.json', function(err, contents) {
      if (err) return done(err);
      try {
        done(undefined, JSON.parse(contents).config || {});
      } catch(err) {
        done(err);
      }
    });
  });
}

/**
 * Loads the options.
 * @param {Array.<{option: string, text: string}>} entries
 * @returns {Object.<string, *>}
 */
function loadOptions(entries) {
  var options = new Command().version(require('../../package').version);
  entries.forEach(function(entry) {
    options.option(entry.option, entry.text, entry.parse);
  });
  return options.parse(process.argv);
}

/**
 * Expands each variable.
 * @param {Object} root
 * @param {Object.<string, string>} config
 * @param {function()} done
 */
function variables(root, config, done) {
  var expression = /\$v\[(.+?)\]/g;
  each(Object.keys(root), function(key, next) {
    var value = root[key];
    if (typeof value === 'object') return variables(value, config, next);
    if (typeof value !== 'string') return next();
    root[key] = value.replace(expression, function(match, matchKey) {
      return config[matchKey] || match;
    });
    next();
  }, done);
}
