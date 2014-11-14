var
  _ = require('underscore'),
  format = require('util').format,

  User = require('../../models/User'),

  Configuration = require('../../helpers/Configuration'),

  ACLService = require('../../services/ACL'),
  SmsService = require('../../services/Sms');

module.exports = {
  all: ACLService.checkPermission,

  create: function (req, res, next) {
    var
      userReq = req.user,
      password,
      user;

    user = new User(req.body);

    if (user.permission === 'superAdmin') {
      next({ status: 403, body: { name: 'PermissionError' } });
      return;
    } else {
      user._owner = userReq.owner;
    }

    password = new Buffer(user.password, 'base64').toString('ascii');

    user.save(function (err, user) {
      if (err) {
        next({ status: 400, body: err });
        return;
      }

      SmsService.sendSms(format(Configuration.get('messages.registrationSms'), user.username, password), user.phone);

      res.send(200, { id: user._id });
    });
  },

  index: function (req, res, next) {
    var user = req.user;

    User.find({ $or: [{ _id: user.owner }, { _owner: user.owner }], deleted: false }).exec(function (err, users) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      users = _.map(users, function (user) {
        return _.pick(user,
          'username',
          'name',
          'email',
          'phone',
          'permission',
          '_id',
          '__v'
        );
      });

      res.send(users);
    });
  },

  show: function (req, res, next) {
    var
      owner = req.user.owner.toString(),
      userId = req.params.user,
      options = {};

    options._id = userId;
    options.deleted = false;

    if (owner !== userId) {
      options._owner = owner;
    }

    User.findOne(options).exec(function (err, user) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!user) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'user', type: 'unknown' } });
        return;
      }

      user = _.pick(user,
        'username',
        'firstName',
        'lastName',
        'email',
        'phone',
        'permission',
        '_id',
        '__v'
      );

      res.send(user);
    });
  },

  update: function (req, res, next) {
    var
      owner = req.user.owner.toString(),
      userId = req.params.user,
      sendSms = false,
      password,
      options = {},
      userUpdate = req.body;

    options._id = userId;
    options.deleted = false;

    if (owner !== userId) {
      options._owner = owner;
    }

    User.findOne(options).exec(function (err, user) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!user) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'user', type: 'unknown' } });
        return;
      }

      if (user.get('__v') != userUpdate.__v) {
        next({ status: 409, body: { name: 'ValidatorError', path: 'user', type: 'invalidVersion' } });
        return;
      }

      if (userUpdate.permission === 'superAdmin' && user.permission !== 'superAdmin') {
        next({ status: 403, body: { name: 'PermissionError' } });
        return;
      }

      if (user.permission === 'superAdmin' && userUpdate.permission !== 'superAdmin') {
        next({ status: 403, body: { name: 'PermissionError' } });
        return;
      }

      if (user.permission === 'superAdmin') {
        delete userUpdate.permission;
      }

      if (userUpdate.password === undefined || userUpdate.password.length === 0) {
        delete userUpdate.password;
      } else {
        password = true;
      }

      if (password || user.username !== userUpdate.username) {
        sendSms = true;
      }

      _.map(userUpdate, function (value, key) {
        user[key] = value;
      });

      user.increment();

      user.save(function (err, user) {
        if (err) {
          next({ status: 400, body: err });
          return;
        }

        if (sendSms) {
          SmsService.sendSms(format(Configuration.get('messages.userUpdateSms'), user.username, new Buffer(userUpdate.password, 'base64').toString('ascii')), user.phone);
        }

        res.send(200, { id: user._id });
      });
    });
  },

  destroy: function (req, res, next) {
    var
      owner = req.user.owner.toString(),
      userId = req.params.user,
      options = {};

    options._id = userId;
    options.deleted = false;

    if (owner !== userId) {
      options._owner = owner;
    }

    User.findOne(options).exec(function (err, user) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!user) {
        res.send(204);
        return;
      }

      if (user.permission === 'superAdmin') {
        next({ status: 403, body: { name: 'PermissionError' } });
        return;
      }

      user.deleted = true;
      user._owner = undefined;

      user.save(function (err, user) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        res.send(204);
      });
    });
  }
};
