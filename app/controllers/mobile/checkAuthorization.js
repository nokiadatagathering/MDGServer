var passport = require('passport');

exports.checkAuthorization = function (req, res, next) {
  var use400 = req.param('use400');

  passport.authenticate('digest', function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.set('www-authenticate', info);

      if (use400) {
        next({ status: 400, body: {} });
      } else {
        next({ status: 401 });
      }

      return;
    }

    return res.send(200);
  })(req, res, next);
};
