var Configuration = require('../../helpers/Configuration');

exports.home = function (req, res, next) {
  res.render('getStarted/jade/home', {});
};

exports.getStarted = function (req, res, next) {
  res.render('getStarted/jade/getStarted', {});
};

exports.useCases = function (req, res, next) {
  res.render('getStarted/jade/useCases', {});
};

exports.openSource = function (req, res, next) {
  res.render('getStarted/jade/openSource', {});
};

exports.support = function (req, res, next) {
  res.render('getStarted/jade/support', {});
};

exports.login = function (req, res, next) {
  res.render('getStarted/jade/login', {});
};

exports.register = function (req, res, next) {
  res.render('getStarted/jade/register', {
    title: Configuration.get('general.siteName'),
    countries:  Configuration.get('general.countries')
  });
};
