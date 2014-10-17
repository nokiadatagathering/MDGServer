var
  MailService = require('../../services/Mail'),
  Configuration = require('../../helpers/Configuration'),
  preferred = Configuration.get('languages.preferred'),

  User = require('../../models/User');

exports.forgotPassword = function (req, res, next) {
  var
    username = req.body.username,
    email = req.body.email;

  if (!email) {
    res.send(204);
    return;
  }

  if (username) {
    User.findOne({ username: username, email: email }).exec(function (err, user) {
      if (err || !user) {
       res.send(204);
       return;
      }

      user.setResetPasswordToken();

      user.save(function (err, user) {
        if (err) {
          next({ status: 400, body: err });
          return;
        }

        MailService.sendMail({ user: user, url: req.protocol + '://' + req.get('host')  }, 'resetPassword');

        res.send(204);
      });
    });
  } else {
    User.find({ email: email }, ('username permission company'), function (err, users) {
      if (err || users.length === 0) {
        res.send(204);
        return;
      }

      MailService.sendMail({ users: users, email: email, url: req.protocol + '://' + req.get('host')  }, 'forgotUsername');

      res.send(204);
    });
  }
};

exports.resetPassword = function (req, res, next) {
  var
    token = req.params.token,
    password = req.body.password;

  User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }).exec(function (err, user) {
    if (err) {
      next({ status: 400, body: err });
      return;
    }

    if (!user) {
      res.redirect('/#/resetPasswordError');
      return;
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.password = password;

    user.increment();

    user.save(function (err, user) {
      if (err) {
        next({ status: 400, body: err });
        return;
      }

      MailService.sendMail({ user: user }, 'passwordChanged');

      res.send(204);
    });
  });
};
