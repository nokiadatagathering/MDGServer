var
  _ = require('underscore'),

  Survey = require('../../models/Survey'),

  SurveyParserService = require('../../services/SurveyParser'),
  SurveyService = require('../../services/Survey'),

  JXON = require('../../helpers/JXON'),
  Configuration = require('../../helpers/Configuration');

exports.index = function (req, res, next) {
  var
    user = req.user,
    surveysToSend = [],
    jxonTree;

  _.each(user._surveys, function (send, id) {
    if (!send) {
      surveysToSend.push(id);
      user._surveys[id] = true;
    }
  });

  user.markModified('_surveys');

  function getXform (survey) {
    return {
      tagName: 'xform',
      value: null,
      attrs: {
        xmlns: ""
      },
      items: [
        {
          tagName: 'formID',
          attrs: {},
          items: [],
          value: survey._id
        },
        {
          tagName: 'name',
          attrs: {},
          items: [],
          value: survey.title
        },
        {
          tagName: 'majorMinorVersion',
          attrs: {},
          items: [],
          value: '1.0'
        },
        {
          tagName: 'downloadUrl',
          attrs: {},
          items: [],
          value: req.protocol + '://' + req.get('host') + '/ReceiveSurvey/' + survey._id
        }
      ]
    };
  }

  Survey.find({ _id: { $in: surveysToSend } }, 'title').exec(function (err, surveys) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    jxonTree = {
      attrs: {
        xmlns: "http://openrosa.org/xforms/xformsList"
      },
      tagName: 'xforms',
      value: null,
      items: _.map(surveys, getXform)
    };

    user.save();

    res.header('Content-Type','text/xml');
    res.status(200);
    res.send(JXON.serialize(jxonTree));
  });
};

exports.show = function (req, res, next) {
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

    res.header('Content-Type','text/xml');
    res.send(JXON.serialize(jxonTree));
  });
};
