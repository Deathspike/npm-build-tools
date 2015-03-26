'use strict';

/**
 * Exits with an error to the optional handler or console.
 * @param {Error=} err
 * @param {function(Error=)} done
 */
module.exports = function(err, done) {
  if (done) return done(err);
  if (err) console.error(err.stack || err);
};
