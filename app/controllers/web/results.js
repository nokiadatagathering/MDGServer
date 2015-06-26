var
  _ = require('underscore'),

  ACLService = require('../../services/ACL'),
  ResultsService = require('../../services/Results'),
  SurveyService = require('../../services/Survey'),

  Survey = require('../../models/Survey'),
  Result = require('../../models/Result');

module.exports = {
  all: ACLService.checkPermission,

  index: function (req, res, next) {
    var
      survey = req.params.survey,
      owner = req.user.owner.toString();

    Result
      .find({ _owner: owner, _survey: survey }, 'count instanceID title timeCreated geostamp _user')
      .populate('_user', 'firstName lastName name')
      .exec(function (err, results) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        results = _.map(results, function (result) {
          return result.toObject();
        });

        res.send(results);
    });
  },

  show: function (req, res, next) {
    var
      survey = req.params.survey,
      result = req.params.result,
      owner = req.user.owner.toString();

    Survey
      .findOne({ _owner: owner, _id: survey }, '_categories')
      .exec(function (err, survey) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        if (!survey) {
          next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
          return;
        }

        survey = SurveyService.sortSurveyQuestions(survey);

        Result
          .findOne({ _owner: owner, _survey: survey, _id: result }, 'count instanceID title timeCreated geostamp _user _categoryResults')
          .populate('_user', 'firstName lastName')
          .exec(function (err, result) {
            if (err) {
              next({ status: 500, body: err });
              return;
            }

            if (!result) {
              next({ status: 400, body: { name: 'ValidatorError', path: 'result', type: 'unknown' } });
              return;
            }

            res.send({
              _categoryResults: ResultsService.gatherCategoryResults(result, survey),
              title: result.title,
              timeCreated: result.timeCreated,
              geostamp: result.geostamp,
              _user: result._user,
              _id: result._id
            });
        });
    });
  },

  destroy: function (req, res, next) {
    var
      survey = req.params.survey,
      result = req.params.result,
      owner = req.user.owner.toString();

    Result.findOne({ _owner: owner, _survey: survey, _id: result }).populate('_survey').exec(function (err, result) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!result) {
        res.send(204);
        return;
      }

      survey = result._survey;

      survey.resultsCount = survey.resultsCount - 1;
      survey.save();

      result.remove(function (err) {
        if (err) {
          next({ status: 400, body: err });
          return;
        }

        res.send(204);
      });
    });
  }
};
