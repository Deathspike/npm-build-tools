'use strict';
var childProcess = require('child_process');
var chokidar = require('chokidar');
var cmd = require('./utilities/cmd');
var each = require('./utilities/each');
var exit = require('./utilities/exit');
var shell = process.platform === 'win32' ? ['cmd', '/c'] : ['sh', '-c'];

/**
 * ...
 * @param {({args: Array.<string>, source?: string, watch?: Array.<string>}|Array.<string>|string)=} input
 * @param {function(Error=)=} done
 */
module.exports = function(input, done) {
  parse(input, function(err, options) {
    if (err) return exit(err, done);
    var sourcePath = options.source || process.cwd();
    if (options.watch) return watch(sourcePath, options.watch, options.args);
    run(options.args, function(err) {
      if (err) return exit(err, done);
      if (done) done();
    });
  });
};

/**
 * Runs each command in parallel.
 * @param {Array.<string>} commands
 * @param {function(Error=)} done
 */
function run(commands, done) {
  var children = [];
  var pending = commands.length || 1;
  var err;
  each(commands, function(command, next) {
    children.push(childProcess.spawn(shell[0], [shell[1], command], {
      stdio: ['pipe', process.stdout, process.stderr]
    }).on('exit', function(code) {
      if (!err && code > 0) {
        err = new Error('`' + command + '` failed with exit code ' + code);
        children.forEach(function(child) {
          if (child.connected) child.kill();
        });
      }
      pending -= 1;
      if (pending === 0) done(err);
    }));
    next();
  });
}

/**
 * Parses input into options.
 * @param {({args: Array.<string>, source?: string, watch?: Array.<string>}|Array.<string>|string)=} input
 * @param {function(Error, {args: Array.<string>, source?: string, watch?: Array.<string>}=)} done
 */
 function parse(input, done) {
  if (input && input.args) return done(undefined, input);
  if (input) done(undefined, {args: [].concat(input)});
  cmd([
    {option: '-s, --source <s>', text: 'The source path (for expand/watch).'},
    {option: '-w, --watch <s>', text: 'The watched files.', parse: function(value) {
      return value.split(',');
    }}
  ], done);
}

/**
 * Watches the patterns in the source path and runs commands on changes.
 * @param {string} sourcePath
 * @param {(Array.<string>|string)} patterns
 * @param {Array.<string>} commands
 */
function watch(sourcePath, patterns, commands) {
  var isBusy = false;
  var isPending = false;
  var runnable = function() {
    if (isBusy) return (isPending = true);
    isBusy = true;
    run(commands, function(err) {
      if (err) console.error(err.stack || err);
      isBusy = false;
      if (isPending) runnable(isPending = false);
    });
  };
  chokidar.watch(patterns, {
    cwd: sourcePath,
    ignoreInitial: true
  }).on('add', runnable).on('change', runnable).on('unlink', runnable);
}

if (module === require.main) {
  module.exports();
}
