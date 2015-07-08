var
  _ = require('underscore'),
  async = require('async'),

  Group = require('../../models/Group'),
  User = require('../../models/User'),

  ACLService = require('../../services/ACL');

module.exports = {
  all: ACLService.checkPermission,

  create: function (req, res, next) {
    var
      user = req.user,
      options = {},
      group;

    group = new Group(req.body);

    group._owner = user.owner;

    options.name = group.name;
    options._owner = group._owner;

    Group.findOne(options, function (err, oldGroup) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (oldGroup) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'group name', type: 'unique' } });
        return;
      }

      group.save(function (err, group) {
        if (err) {
          next({ status: 400, body: err });
          return;
        }

        res.send(200, { id: group._id });
      });
    });
  },

  index: function (req, res, next) {
    var
      user = req.user,
      options = {};

    Group.find({ _owner: user.owner }).exec(function (err, groups) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      async.map(groups,
        function (group, cb) {
          User.find({ _group: group._id, deleted: false }, 'username email phone permission firstName lastName name')
            .exec(function (err, users) {
            if (err) {
              cb(err);
              return;
            }

            group = group.toObject();

            users = _.map(users, function (user) {
              return user.toObject();
            });

            group.users = users;

            cb(null, group);
          });
        },
        function (err, groups) {
          if (err) {
            next({ status: 500, body: err });
            return;
          }

          res.send(200, groups);
        }
      );
    });
  },

  show: function (req, res, next) {
    var
      user = req.user,
      groupId = req.params.group;

    Group.findOne({ _id: groupId, _owner: user.owner }).exec(function (err, group) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!group) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'group', type: 'unknown' } });
        return;
      }

      group = group.toObject();

      User.find({ _group: group._id, deleted: false }, 'username email phone permission firstName lastName name').exec(function (err, users) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        users = _.map(users, function (user) {
          return user.toObject();
        });

        group.users = users;

        res.send(200, group);
      });
    });
  },

  update: function (req, res, next) {
    var
      user = req.user,
      groupId = req.params.group,
      incrementGroup = false,
      groupUpdate = req.body;

    groupUpdate.users = groupUpdate.users ? groupUpdate.users : [];

    Group.findOne({ _id: groupId, _owner: user.owner }).exec(function (err, group) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!group) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'group', type: 'unknown' } });
        return;
      }

      if (group.get('__v') != groupUpdate.__v) {
        next({ status: 409, body: { name: 'ValidatorError', path: 'group', type: 'invalidVersion' } });
        return;
      }

      function updateGroupName (next) {

        if (groupUpdate.name && (group.name !== groupUpdate.name)) {
          group.name = groupUpdate.name;

          Group.findOne({ name: group.name }, function (err, oldGroup) {
            if (err) {
              next({ status: 500, body: err });
              return;
            }

            if (oldGroup) {
              next({ status: 400, body: { name: 'ValidatorError', path: 'group name', type: 'unique' } });
              return;
            }

            group.increment();
            group.save(function (err) {
              if (err) {
                next({ status: 500, body: err });
                return;
              }

              next();
            });
          });
        } else {
          next();
        }
      }

      function updateUsers (next) {
        User.find({ _group: group }, '_group').exec(function (err, users) {
          if (err) {
            next({ status: 500, body: err });
            return;
          }

          _.each(users, function (user) {
            var userIndex = groupUpdate.users.indexOf(user._id.toString());

            if (userIndex === -1) {
              user._group = undefined;

              incrementGroup = true;

              user.save(function (err) {
                if (err) {
                  next({ status: 400, body: err });
                  return;
                }

              });
            } else {
              groupUpdate.users.splice(userIndex, 1);
            }
          });

          _.each(groupUpdate.users, function (user) {
            incrementGroup = true;

            User.update({ _id: user }, { $set: { _group: group } }).exec(function (err) {
              if (err) {
                next({ status: 500, body: err });
                return;
              }
            });
          });

          if (incrementGroup) {
            group.increment();

            group.save(function (err, group) {
              if (err) {
                next({ status: 500, body: err });
                return;
              }

              next();
            });
          } else {
            next();
          }
        });
      }

      async.parallel([ updateGroupName, updateUsers ], function (err) {
        if (err) {
          next(err);
          return;
        }
        res.send(200, { id: group._id });
      });
    });
  },

  destroy: function (req, res, next) {
    var
      user = req.user,
      groupId = req.params.group;

    Group.findOne({ _id: groupId, _owner: user.owner }).exec(function (err, group) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!group) {
        res.send(204);
        return;
      }

      User.find({ _group: group }, '_group').exec(function (err, users) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        _.each(users, function (user) {
          user._group = undefined;

          user.save(function (err) {
            if (err) {
              next({ status: 400, body: err });
              return;
            }
          });
        });

        group.remove(function (err) {
          if (err) {
            next({ status: 500, body: err });
            return;
          }

          res.send(204);
        });
      });
    });
  }
};
