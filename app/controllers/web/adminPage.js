var
  User = require('../../models/User'),

  Configuration = require('../../helpers/Configuration'),
  ExportService = require('../../services/Export');

exports.getAdminPage = function (req, res, next) {
  res.render('app/views/adminPage', {
    title: Configuration.get('general.siteName')
  });
};

exports.deleteUser = function (req, res, next) {
  var
    userId = req.body.user,
    options = {};

  options._id = userId;
  options.deleted = false;

  User.findOne(options).exec(function (err, user) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    if (!user) {
      res.send(204);
      return;
    }

    user.deleted = true;
    user.username =  'DELETED_USER_' + user.username;
    user.password =  'DELETED_USER';
    user.email =  'DELETED_USER_' + user.email;
    user._owner = undefined;

    user.save(function (err, user) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      res.send(204);
    });
  });
};
