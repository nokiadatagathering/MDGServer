var
  Survey = require('../../models/Survey'),
  User = require('../../models/User');

exports.publish = function (req, res, next) {
  var
    owner = req.user.owner.toString(),
    surveyId = req.params.id,
    users = req.body.users;

  Survey.findOne({ _id: surveyId, _owner: owner }).exec(function (err, survey) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    if (!survey) {
      next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
      return;
    }

    User.find({ _id: { $in: users }, $or: [{ _id: owner }, { _owner: owner }]  }).exec(function (err, users) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (users.length !== 0) {
        users.map(function (user) {
          user._surveys[surveyId] = false;
          user.markModified('_surveys');

          user.save();
        });

        if (!survey.published) {
          survey.published = true;

          survey.save();
        }
      }

      res.send(204);
    });
  });
};
