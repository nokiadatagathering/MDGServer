var
  _ = require('underscore'),

  User = require('../../models/User'),

  Configuration = require('../../helpers/Configuration'),

  SmsService = require('../../services/Sms');

exports.sendSms = function (req, res, next) {
  var
    type = req.params.type,
    id = req.params.id,
    sms = req.body.sms,
    user = req.user,
    options = {};

  if (type === 'user') {
    options._id = id;
  } else if (type === 'group') {
    options._group = id;
  } else {
    next({ status: 400, body: { name: 'ValidatorError', path: 'sms type', type: 'unknown' } });
    return;
  }

  User.find(options, 'phone').exec(function (err, users) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    _.each(users, function (user) {
      SmsService.sendSms(Configuration.get('messages.headerSms') + sms, user.phone);
    });

    res.send(204);
  });
};
