var
  User = require('../../models/User'),
  UserService = require('../../services/User');

exports.checkUniqueUserField = function (req, res, next) {
  var
    field = req.body.field,
    value = req.body.value,
    userReq = req.user,
    userUpdate = req.params.id,
    options = {};

  if (!value) {
    res.send(200);
    return;
  }

  options[field] = value;

  if (field !== 'username') {
    options.$or = [
      { _id: userReq.owner },
      { _owner: userReq.owner }
    ];
  }

  User
    .findOne(options)
    .exec(function (err, user) {
      if ((user && !userUpdate) || (user && userUpdate.toString() !== user._id.toString())) {
        next({ status: 400, body: { name: 'ValidatorError', path: field, type: 'unique' } });
        return;
      }

      res.send(200);
    });
};
