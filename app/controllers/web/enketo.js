var
  _ = require('underscore'),
  request = require('request'),
  fs = require('fs'),
  Survey = require('../../models/Survey'),
  Result = require('../../models/Result'),
  User = require('../../models/User'),

  JXON = require('../../helpers/JXON'),

  Configuration = require('../../helpers/Configuration'),

  SurveyParserService = require('../../services/SurveyParser'),
  ResultsParserService = require('../../services/ResultsParser'),
  ResultsService = require('../../services/Results'),
  SurveyService = require('../../services/Survey');

function parseJXONTree (jxonTree) {
  return new ResultsParserService.ResultsParser(jxonTree);
}

exports.getEnketoSurveyUrl = function (req, res, next) {
  var
    user = req.user._id,
    survey = req.params.survey;

  request
    .post('https://enketo.org/api_v1/survey', {form :{
      server_url: req.protocol + '://' + req.get('host') + '/enketo/' + user,
      form_id: survey
    }},
    function(err, response, body) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      res.send(JSON.parse(body).url);
    })
    .auth(Configuration.get('enketo.token'), Configuration.get('enketo.token'), false);
};

exports.formList = function (req, res, next) {
  var
    userId = req.params.userId,
    jxonTree;

  User.findById(userId, '_owner').exec(function (err, user) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    if (!user) {
      next({status: 400, body: {name: 'ValidatorError', path: 'user', type: 'unknown'}});
      return;
    }

    Survey.find({ _owner: user.owner, $or: [{ deleted: false }, { deleted: { $exists: false } }]  }, function (err, surveys) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      jxonTree = SurveyParserService.SurveysToJxonTree(surveys, req.protocol + '://' + req.get('host') + '/enketo/' + userId);

      res.setHeader('Content-type', 'text/xml');
      res.send(JXON.serialize(jxonTree));
    });
  });
};

exports.form = function (req, res, next) {
  var
    userId = req.params.userId,
    survey = req.params.survey,
    jxonTree;

  User.findById(userId, '_owner').exec(function (err, user) {
    if (err) {
      next({status: 500, body: err});
      return;
    }

    if (!user) {
      next({status: 400, body: {name: 'ValidatorError', path: 'user', type: 'unknown'}});
      return;
    }

    Survey
      .findOne({ _id: survey, _owner: user.owner, $or: [{ deleted: false }, { deleted: { $exists: false } }] })
      .exec(function (err, survey) {
        if (err) {
          next({status: 500, body: err});
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

        jxonTree = SurveyParserService.SurveyToJxonTree(SurveyService.composeSurveyData(survey, true));

        res.setHeader('Content-disposition', 'attachment; filename="survey_' + survey._id.toString() + '.xml"');
        res.setHeader('Content-type', 'text/xml');
        res.send(JXON.serialize(jxonTree));
      }
    );
  });
};

exports.submission = function (req, res, next) {
  var
    userId = req.params.userId,
    results = new Result();

  if (!req.files || !req.files.xml_submission_file) {
    next({ status: 400, body: { name: 'ValidatorError', path: 'filename', type: 'required' }});
    return;
  }

  function callback(err, resultData) {
    if (req.files && req.files.xml_submission_file) {
      fs.unlink(req.files.xml_submission_file.path);
    }

    if (err) {
      console.log('error on parsing xml survey data', err);

      next({status: 500, body: err});
      return;
    }

    resultData = parseJXONTree(resultData);

    User.findById(userId, '_owner').exec(function (err, user) {
      if (err) {
        next({status: 500, body: err});
        return;
      }

      if (!user) {
        next({status: 400, body: {name: 'ValidatorError', path: 'user', type: 'unknown'}});
        return;
      }

      Survey
        .findOne({ _id: resultData.survey, _owner: user.owner, $or: [{ deleted: false }, { deleted: { $exists: false } }] })
        .exec(function (err, survey) {
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

              res.send(201, { id: results._id });
            });
          });
        });
    });
  }

  if (req.files && req.files.xml_submission_file) {
    JXON.readFile(req.files.xml_submission_file.path, JXON.WITHOUT_VALIDATION, callback);
  }
};
