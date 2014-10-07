var
  moment = require('moment'),

  Configuration = require('../../helpers/Configuration'),
  ExportService = require('../../services/Export');

exports.getReportPage = function (req, res, next) {
  var
    initYear = 2012,
    currentYear = new Date().getFullYear(),
    years = [],
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  for (var i = 0; (initYear + i) <= currentYear; i++) {
    years.push(initYear + i);
  }

  res.render('monthlyReport', {
    title: Configuration.get('general.siteName'),
    years: years,
    months: months
  });
};

exports.sendReport = function (req, res, next) {
  var
    date,
    email = req.body.email,
    year = req.body.year,
    month = req.body.month;

  date = moment(year + '-' + month, "YYYY MMMM").add(1, 'months').startOf('month');

  ExportService.exportUserRegistrations(email, date);
  res.render('sentMonthlyReport', {
    title: Configuration.get('general.siteName'),
    email: email
  });
};
