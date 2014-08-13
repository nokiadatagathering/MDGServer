var Survey = require('../../models/Survey');

exports.archive = function (req, res, next) {
  var
    owner = req.user.owner.toString(),
    surveyId = req.params.id;

  Survey.findOne({ _id: surveyId, _owner: owner }).exec(function (err, survey) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    if (!survey) {
      next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
      return;
    }

    survey.archive = !survey.archive;

    survey.save(function (err, survey) {
      if (err) {
        next({ status: 400, body: err });
        return;
      }

      res.send(200, { id: survey._id });
    });
  });
};
