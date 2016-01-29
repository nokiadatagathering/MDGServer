var
  _ = require('underscore'),
  async = require('async'),
  excelExport = require('excel-export'),

  Subscription = require('../models/Subscription'),
  Result = require('../models/Result'),

  JXON = require('../helpers/JXON'),

  ExportService = require('./Export');
  MailService = require('./Mail');

exports.sendSubscriptionEmail = function () {
  var
    jxonTree,
    questions = [],
    xls = {},
    kmldata,
    csvdata,
    xlsdata,
    zip,
    resultsData;

  Subscription.find({ wassent: false, to: { $lt: new Date() } }).populate('_survey')
    .exec(function (err, subscriptions) {
      if (err) {
        console.log(err);
        return;
      }

      async.mapSeries(subscriptions, function (subscription, cb) {
        questions = [];

        _.each(subscription._survey._categories, function (category) {
          _.each(category._questions, function (question) {
            if (/cascade/.test(question.type) && questions[questions.length - 1] && questions[questions.length - 1].type === question.type) {
              questions[questions.length-1].items = questions[questions.length-1].items.concat(question.items);
              return;
            }

            questions.push({
              label: question.label,
              type: question.type,
              items: question.items
            });
          });
        });

        Result
          .find({ _survey: subscription._survey._id, timeCreated: { $gt: subscription.from, $lt: subscription.to } })
          .populate('_user', 'username phone')
          .exec(function (err, results) {
            if (err) {
              cb(err);
              return;
            }

            if (results.length === 0) {
              cb(null, {
                subscription: subscription,
                data: null
              });
              return;
            }

            jxonTree = ExportService.createKML(questions, results);

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

            kmldata = JXON.serialize(jxonTree);
            csvdata = resultsData.header + resultsData.body;
            xlsdata = excelExport.execute(xls);

            ExportService.compressData('survey_' + subscription._survey._id, { csv: csvdata, kml: kmldata, xlsx: xlsdata },
              resultsData.images, function (data) {
                zip = data.generate({ base64: false });

                cb(null, {
                  subscription: subscription,
                  data: zip
                });
              });
          });
      }, function (err, results) {
        if (err) {
          throw new Error(err);
        }

        _.each(results, function (result) {
          result.subscription.wassent = true;
          result.subscription.save();

          if (result.data) {
            MailService.sendMail({
              subscription: result.subscription,
              data: result.data
            }, 'subscription');
          }
        });
      });
    });
};
