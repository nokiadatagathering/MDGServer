var Survey = require('../../models/Survey');

exports.duplicate = function (req, res, next) {
  var
    user = req.user,
    owner = req.user.owner.toString(),
    surveyId = req.params.id,
    newSurvey = new Survey();

  Survey.findOne({ _id: surveyId, _owner: owner }).exec(function (err, survey) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    if (!survey) {
      next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
      return;
    }

    newSurvey._creator = user;
    newSurvey.title = survey.title;
    newSurvey._categories = survey._categories;
    newSurvey._owner = survey._owner;

    newSurvey.save(function (err, survey) {
      if (err) {
        next({ status: 400, body: err });
        return;
      }

      res.send(200, { id: survey._id });
    });
  });
};
