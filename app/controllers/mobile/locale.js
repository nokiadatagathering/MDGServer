var
  Configuration = require('../../helpers/Configuration'),
  fs = require('fs');

exports.getLocale = function (req, res, next) {
  var
    locale = req.param('locale').split('-')[0],
    path = './app/resources/locale/messages_' + locale + '.properties';

  fs.exists(path, function (exists) {
    if (!exists) {
      next({ status: 404 });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    fs.createReadStream(path).pipe(res);
  });
};


exports.languageList = function (req, res, next) {
  var languages = Configuration.get('languages.supported_languages_mobile');
  res.send(languages);
};