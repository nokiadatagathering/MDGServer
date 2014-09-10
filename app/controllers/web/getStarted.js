var Configuration = require('../../helpers/Configuration');

exports.home = function (req, res, next) {
  res.render('getStarted/jade/home', {
    title: Configuration.get('general.siteName'),
    countries:  Configuration.get('general.countries')
  });
};
