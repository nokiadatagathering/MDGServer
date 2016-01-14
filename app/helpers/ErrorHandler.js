var ErrorsHumanizer = require('./ErrorsHumanizer');

module.exports = function (err, req, res, next) {
  throw err;
  if (err.status === 400 || err.status === 403 || err.status === 409) {
    err.body = ErrorsHumanizer(err.body);
  }
  err.body = err.body ? err.body : {};

  res.send(err.status, err.body);
};
