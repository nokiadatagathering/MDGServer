var
  _ = require('underscore'),
  passport = require('passport'),
  jsonwebtoken = require('jsonwebtoken'),

  MailService = require('../../services/Mail'),

  User = require('../../models/User');

exports.login = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      next({ status: 401, body: {success: false} });
      return;
    }

    return res.json({success: true, token: jsonwebtoken.sign(user.id, 'secret')});
  })(req, res, next);
};

exports.activate = function (req, res, next) {
  User
    .update({ activatedCode: req.params.code }, { $set: { activated: true, activatedCode: null } })
    .exec(function (err) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      res.redirect('/home#/login');
  });
};

exports.logout = function (req, res, next) {
  req.logout();
  res.send(204);
};

exports.signup = function (req, res, next) {
  var user = new User(req.body);

  user.permission = 'superAdmin';

  user.save(function (err, user) {
    if (err) {
      next({ status: 400, body: err });
      return;
    }

    MailService.sendMail({ user: user, url: req.protocol + '://' + req.get('host')  }, 'registration');

    res.send(204);
  });
};

exports.permission = function (req, res, next) {
  res.send(200, _.pick(req.user, 'permission', 'username', 'firstName', 'lastName', 'name', '_id'));
};
