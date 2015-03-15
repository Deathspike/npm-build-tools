'use strict';

/**
 * Invokes the handler for each item in series.
 * @param {(Array.<T>|T)} items
 * @param {function(T, function(Error=))} handler
 * @param {function(Error=)} done
 * @template T
 */
module.exports = function(items, handler, done) {
  var i = -1;
  if (!Array.isArray(items)) items = [items];
  (function next(err) {
    i += 1;
    if (err || i >= items.length) return done(err);
    handler(items[i], next);
  })();
};
