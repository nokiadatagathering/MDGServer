var
  _ = require('underscore'),
  User = require('../models/User');

exports.encryptPasswords = function () {
  User.find({ $or: [{ encrypted: false }, { encrypted: { $exists: false } }] }).exec(function (err, users) {
    if (err) {
      throw new Error(err);
    }

    _.each(users, function (user) {
      user.encrypted = true;

      user.save(function (err) {
        if (err) {
          console.log('err', err);
        }
      });
    });
  });
};
