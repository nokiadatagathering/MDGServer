var
  fs = require('fs'),

  Survey = require('../../models/Survey'),
  Result = require('../../models/Result'),

  JXON = require('../../helpers/JXON'),

  ResultsParserService = require('../../services/ResultsParser'),
  ResultsService = require('../../services/Results');

function parseJXONTree (jxonTree) {
  return new ResultsParserService.ResultsParser(jxonTree);
}

exports.postResults = function (req, res, next) {
  var
    user = req.user,
    surveyId = req.body.surveyId,
    results = new Result();

  if (!req.files || !req.files.filename) {
    next({ status: 400, body: { name: 'ValidatorError', path: 'filename', type: 'required' } });
    return;
  }

  function callback (err, resultData) {
    if (req.files && req.files.filename) {
      fs.unlink(req.files.filename.path);
    }

    if (err) {
      console.log('error on parsing xml survey data', err);

      next({ status: 500, body: err });
      return;
    }

    resultData = parseJXONTree(resultData);

    Survey.findOne({ _owner: user.owner, _id: surveyId }).exec(function (err, survey) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!survey) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
        return;
      }

      if (!survey.published) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unpublished' } });
        return;
      }

      results._owner = user.owner;
      results._user = user._id;

      results = ResultsService.composeResults(results, resultData, survey, function (results) {
        results.save(function (err, results) {
          if (err) {
            next({ status: 400, body: err });
            return;
          }

          survey.resultsCount = survey.resultsCount + 1;
          survey.save();

          res.send(200, { id: results._id });
        });
      });
    });
  }

  if (req.files && req.files.filename) {
    JXON.readFile(req.files.filename.path, JXON.WITHOUT_VALIDATION, callback);
  }
};
