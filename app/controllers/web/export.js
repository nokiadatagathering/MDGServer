var
  _ = require('underscore'),
  excelExport = require('excel-export'),

  JXON = require('../../helpers/JXON'),

  ExportService = require('../../services/Export'),
  SurveyService = require('../../services/Survey'),

  Survey = require('../../models/Survey'),
  Result = require('../../models/Result');

exports.export = function (req, res, next) {
  var
    surveyId = req.params.id,
    type = req.param('type') ? req.param('type') : 'xls',
    results = req.body.results,
    response,
    responseContent,
    contentDisposition,
    contentType,
    binary = false,
    owner = req.user.owner,
    resultsData = {},
    questions = [];

  Survey.findOne({ _id: surveyId, _owner: owner }).exec(function (err, survey) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    if (!survey) {
      next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
      return;
    }

    survey = SurveyService.sortSurveyQuestions(survey);

    _.each(survey._categories, function (category) {
      _.each(category._questions, function (question) {
        if (/cascade/.test(question.type) && questions[questions.length - 1] && questions[questions.length - 1].type === question.type) {
          questions[questions.length-1].items = questions[questions.length-1].items.concat(question.items);
          questions[questions.length-1].id.push(question.id);
          return;
        }

        questions.push({
          label: question.label,
          id: [question.id],
          type: question.type,
          items: question.items
        });
      });
    });

    Result
      .find({ _id: { $in: results }, _owner: owner, _survey: survey })
      .populate('_user', 'username phone')
      .exec(function (err, results) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        if (type === 'kml') {
          var jxonTree = ExportService.createKML(questions, results);

          contentDisposition = 'attachment; filename="survey_' + survey._id.toString() + '.kml"';
          contentType = 'text/xml';
          response = JXON.serialize(jxonTree);
        }

        if (type === 'csv') {
          resultsData = ExportService.getResultsData(questions, results);

          resultsData.data = resultsData.header + resultsData.body;

          if (resultsData.images && resultsData.images.length !== 0) {
            contentDisposition = 'attachment; filename="' + 'survey_' + results[0]._survey + '.zip' + '"';
            contentType = "application/octet-stream";
            responseContent = { csv: resultsData.data };
            binary = true;
          } else {
            contentDisposition = 'attachment; filename="survey_' + survey._id.toString() + '.csv"';
            contentType = 'text/csv';
            response = resultsData.data;
          }
        }

        if (type === 'xls') {
          var xls = {};

          resultsData = ExportService.getResultsData(questions, results);

          xls.rows = _.map(resultsData.body.trim(/\r\n/).split(/\r\n/), function (row) {
            return row.split(/\|/);
          });

          xls.cols = _.map(resultsData.header.split(/\|/), function (header) {
            return {
              caption: header,
              type: 'string'
            };
          });

          resultsData.data = excelExport.execute(xls);

          if (resultsData.images && resultsData.images.length !== 0) {
            contentDisposition = 'attachment; filename="' + 'survey_' + results[0]._survey + '.zip' + '"';
            contentType = "application/octet-stream";
            responseContent = { xlsx: resultsData.data };
            binary = true;
          } else {
            contentDisposition = 'attachment; filename=survey_' + survey._id.toString() + '.xlsx';
            contentType = 'application/vnd.ms-excel';
            response = resultsData.data;
            binary = true;
          }
        }

        res.setHeader('Content-disposition', contentDisposition);
        res.setHeader('Content-type', contentType);

        if (resultsData.images && resultsData.images.length !== 0) {
          ExportService.compressData('survey_' + results[0]._survey, responseContent, resultsData.images, function (zip) {
            res.write(zip.generate({ base64: false }), 'binary');
            res.end();
          });
        } else if (binary) {
          res.write(response, 'binary');
          res.end();
        } else {
          res.write(response);
          res.end();
        }
      });
  });
};
