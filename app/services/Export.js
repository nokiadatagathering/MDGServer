var
  _ = require('underscore'),
  fs = require('fs'),
  async = require('async'),
  moment = require('moment'),
  easyZip = require('easy-zip').EasyZip,
  excelBuilder = require('msexcel-builder'),

  ImagesService = require('../services/Images'),
  MailService = require('../services/Mail'),

  Configuration = require('../helpers/Configuration'),

  Survey = require('../models/Survey'),
  User = require('../models/User'),
  Result = require('../models/Result');

function getDescription (questions, result) {
  var
    labels = _.clone(questions),
    question,
    res = '';

  _.each(result._categoryResults, function (category) {
    _.each(category._questionResults, function (questionResult) {
      question = labels.shift();

      res = res + '<h3><b>' + question.label + '</b></h3>';

      if (questionResult.result) {
        if (question.type === 'date') {
          res = res + "<h4 style='color:#3a77ca'><b>" + moment(questionResult.result).format('YYYY-MM-DD') + '</b></h4>';
        } else if (question.type === 'time') {
          res = res + "<h4 style='color:#3a77ca'><b>" + /(\d{2}:\d{2})/.exec(questionResult.result)[1] + '</b></h4>';
        } else if (question.type === 'binary') {
          res = res + "<h4><b>" + '#image' + '</b></h4>';
        } else {
          res = res + "<h4 style='color:#3a77ca'><b>" + questionResult.result + '</b></h4>';
        }
      }
    });
  });

  return res;
}

function getPlacemarks (questions, results) {
  var placemarks = [];

  _.each(results, function (result) {
    if (!result.geostamp) {
      return;
    }

    placemarks.push({
      attrs: {},
      tagName: 'Placemark',
      value: null,
      items: [
        {
          attrs: {},
          tagName: 'name',
          value: result.title,
          items: []
        },
        {
          attrs: {},
          tagName: 'open',
          value: 1,
          items: []
        },
        {
          attrs: {},
          tagName: 'description',
          value: getDescription(questions, result),
          items: []
        },
        {
          attrs: {},
          tagName: 'Point',
          value: null,
          items: [
            {
              attrs: {},
              tagName: 'coordinates',
              value: result.geostamp.split(' ')[1] + ',' + result.geostamp.split(' ')[0],
              items: []
            }
          ]
        }
      ]
    });
  });

  return placemarks;
}

exports.createKML = function (questions, results) {
  return {
    attrs: {
      xmlns: "http://www.opengis.net/kml/2.2",
      "xmlns:gx": "http://www.google.com/kml/ext/2.2",
      "xmlns:atom": "http://www.w3.org/2005/Atom",
      "xmlns:xal": "urn:oasis:names:tc:ciq:xsdschema:xAL:2.0"
    },
    tagName: 'kml',
    value: null,
    items: [
      {
        attrs: {},
        tagName: 'Document',
        value: null,
        items: getPlacemarks(questions, results)
      }
    ]
  };
};

function getResultMetaData (result) {
  var
    geostamp,
    res = '\r\n' +
      result._id + '|' +
      result._survey + '|' +
      result.title + '|' +
      result.timeStart.toISOString() + '|' +
      result.timeEnd.toISOString() + '|' +
      result.timeCreated.toISOString() + '|' +
      result._user.username + '|';

  if (result.geostamp) {
    geostamp = result.geostamp.split(' ');
    res = res + geostamp[0] + '|' + geostamp[1] + '|';
  } else {
    res = res + '||';
  }

  res = res + result._user.phone + '|';

  return res;
}

exports.compressData = function (archiveName, filesData, images, callback) {
  var zip = new easyZip();

  if (!images) {
    images = [];
  }

  async.mapSeries(images, function (image, cb) {
    ImagesService.getImageAsBuffer(image.filename, function (buffer) {
      if (buffer) {
        zip.file(image.file, buffer, { base64: true, binary: true });
      }

      cb();
    });
  }, function () {
    _.each(filesData, function (data, fileType) {
      zip.file(archiveName + '.' + fileType, data, { base64: false, binary: true });
    });

    callback(zip);
  });
};

exports.getResultsData = function (questions, results) {
  var
    header = 'ResultId|SurveyId|Title|Start time|End time|Date Sent|User|Lat|Lon|Phone Number|',
    images = [],
    res = '',
    body = '',
    questionResult;

  _.each(questions, function (question) {
    header = header + question.label + '|';
  });

  _.each(results, function (result) {
    body = body + getResultMetaData(result);

    _.each(questions, function (question) {
      questionResult = {};

      _.find(result._categoryResults, function (c) {
        return _.find(c._questionResults, function (q) {
          if (question.id.indexOf(q.id) !== -1) {
            questionResult = q;
            return true;
          }
        });
      });

      res = questionResult.result;

      if (questionResult.result === undefined) {
        res = '';
      } else if (
        question.type === 'binary' ||
        question.type === 'binary#image'
      ) {
        res = 'photos/' + result._id + '/' + questionResult.result;

        images.push({
          file: res,
          filename: questionResult.result
        });
      } else if (question.type === 'date') {
        res = moment(questionResult.result).format('YYYY-MM-DD');
      } else if (question.type === 'time') {
        res = /(\d{2}:\d{2})/.exec(questionResult.result)[1];
      } else if (
        question.type === 'select' ||
        question.type === 'select1' ||
        /cascade/.test(question.type )
      ) {
        res = _.map(res.trim().split(/ +/), function (value) {
          return '"' + _.find(question.items, function (item) {
              return item.value == value;
            }).text + '"';
        });
      }

      body = body + res + '|';
    });
  });

  return {
    header: header,
    body: body,
    images: images
  };
};

exports.exportUserRegistrations = function (email, requestedDate) {
  var
    oldest,
    emails = email ? [email] : Configuration.get('mail.emailsForUsersReport'),
    columnHeaders = ['Type', 'Organization', 'Country', 'Industry', 'First Name', 'Last Name', 'Email', 'Notes', 'Status'],
    months = [],
    date = requestedDate ? requestedDate : moment().startOf('month'),
    filename =  'MDG_monthly_report_' + date.subtract('months', 1).format('MM_YYYY') + '.xlsx',
    workbook = excelBuilder.createWorkbook('./', filename);

  User.find({ timeCreated: { $exists: true } }).sort({ timeCreated: 1 }).limit(1).exec(function (err, user) {
    oldest = moment(user[0].timeCreated).startOf('month');

    while (date >= oldest) {
      months.push({
        start: moment(date.startOf('month')).toDate(),
        end: moment(date.endOf('month')).toDate()
      });

      date.subtract('months', 1);
    }

    async.mapSeries(months, function (month, cb) {
      var
        line,
        date = moment(month.start);

      User.find({ timeCreated: { $gt: month.start, $lt: month.end } }).exec(function (err, users) {
        month.sheet = workbook.createSheet(date.format('MMM YYYY'), 9, users.length + 5);
        month.sheet.merge({ col: 1, row: 2 }, { col: 9, row: 2 });
        month.sheet.set(1, 2, 'New registrations to the MDG hosted server ' + date.format('MMMM YYYY'));
        month.sheet.align(1, 2, 'center');
        month.sheet.fill(1, 2, { type: 'solid', fgColor: '8', bgColor: '64' });

        for (var j = 1; j <= columnHeaders.length; j++) {
          month.sheet.set(j, 4, columnHeaders[j - 1]);
          month.sheet.font(j, 4, { sz: 10, bold: 'true' });
          month.sheet.width(j, 20);
        }

        for (var i = 0; i < users.length; i++) {
          line = i + 6;

          month.sheet.set(1, line, users[i].permission);
          month.sheet.font(1, line, { sz: 10 });

          month.sheet.set(2, line, users[i].company);
          month.sheet.font(2, line, { sz: 10 });

          month.sheet.set(3, line, users[i].country);
          month.sheet.font(3, line, { sz: 10 });

          month.sheet.set(4, line, users[i].industry);
          month.sheet.font(4, line, { sz: 10 });

          month.sheet.set(5, line, users[i].firstName);
          month.sheet.font(5, line, { sz: 10 });

          month.sheet.set(6, line, users[i].lastName);
          month.sheet.font(6, line, { sz: 10 });

          month.sheet.set(7, line, users[i].email);
          month.sheet.font(7, line, { sz: 10 });

          if (users[i].deleted) {
            month.sheet.set(9, line, 'deleted');
            month.sheet.font(9, line, { sz: 10 });
          }
        }

        cb(null, month);
      });
    }, function (err, months) {
      if (months.length === 0) {
        return;
      }

      workbook.save(function (ok) {
        if (!ok) {
          workbook.cancel();
        }

        fs.readFile('./' + filename, function (err, data) {
          if (err) {
            fs.unlinkSync('./' + filename);
            throw new Error();
          }

          _.each(emails, function (email) {
            MailService.sendMail({
              filename: filename,
              data: data,
              email: email,
              month: moment().subtract('months', 1).format('MMMM')
            }, 'report');
          });

          fs.unlinkSync('./' + filename);
        });
      });
    });
  });
};
