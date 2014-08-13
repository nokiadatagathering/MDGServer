var
  fs = require('fs'),

  JXON = require('../../helpers/JXON'),

  Survey = require('../../models/Survey'),

  SurveyParserService = require('../../services/SurveyParser'),
  SurveyService = require('../../services/Survey');

function parseJXONTree (jxonTree) {
  return new SurveyParserService.Survey(jxonTree);
}

exports.import = function (req, res, next) {
  var
    survey = new Survey(),
    user = req.user;

  if ((!req.files || !req.files.xml) && !req.body.xml) {
    next({ status: 400, body: { name: 'ValidatorError', path: 'xml file', type: 'required' } });

    return;
  }

  function callback (err, surveyData) {
    if (req.files && req.files.xml) {
      fs.unlink(req.files.xml.path);
    }

    if (err) {
      console.log('error on parsing xml survey data', err);

      next({ status: 400, body: { name: 'ValidatorError', path: 'xml file', type: 'xmlFormat' } });

      return;
    }

    surveyData = parseJXONTree(surveyData);

    survey._creator = user._id;
    survey._owner = user.owner;

    survey = SurveyService.composeSurvey(survey, surveyData);

    survey.save(function (err, survey) {
      if (err) {
        next({ status: 400, body: err });
        return;
      }

      res.send(200, { id: survey._id });
    });
  }

  if (req.files && req.files.xml) {
    JXON.readFile(req.files.xml.path, JXON.WITH_VALIDATION, callback);
  } else {
    JXON.readString(req.body.xml, JXON.WITH_VALIDATION, callback);
  }
};

exports.export = function (req, res, next) {
  var
    owner = req.user.owner,
    survey = req.params.id,
    jxonTree;

  Survey.findOne({ _id: survey, _owner: owner }).exec(function (err, survey) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    jxonTree = SurveyParserService.SurveyToJxonTree(SurveyService.composeSurveyData(survey));

    res.setHeader('Content-disposition', 'attachment; filename="survey_' + survey._id.toString() + '.xml"');
    res.setHeader('Content-type', 'text/xml');
    res.end(JXON.serialize(jxonTree));
  });
};
