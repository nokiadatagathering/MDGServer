var
  querystring = require('querystring'),
  Configuration = require('../../helpers/Configuration'),
  languages = Configuration.get('languages.supported_languages'),
  preferred = Configuration.get('languages.preferred');

exports.home = function (req, res, next) {
  var lang = req.cookies.NG_TRANSLATE_LANG_KEY;

  if (!lang || lang==='undefined') {
    lang = preferred;
    res.cookie('NG_TRANSLATE_LANG_KEY', '"' + lang + '"');
  } else {
    if (lang.length > 2) {
      lang = lang.toString().slice(1,3);
    }
  }

  res.render('app/views/getStarted/jade/' + lang + '/home', {
    title: Configuration.get('general.siteName'),
    clientId: Configuration.get('OAuth.clientId'),
    redirect_uri: querystring.stringify({ redirect_uri: req.protocol + '://' + req.get('host') + Configuration.get('OAuth.redirectUrl') }),
    countries:  Configuration.get('general.countries'),
    language: lang,
    languages: languages
  });
};

exports.languages = function (req, res, next) {
  res.send({
    languages: languages,
    preferred: preferred
  });
};

exports.error404 = function (req, res, next) {
  var lang = req.cookies.NG_TRANSLATE_LANG_KEY;

  if (!lang || lang==='undefined') {
    lang = preferred;
    res.cookie('NG_TRANSLATE_LANG_KEY', '"' + lang + '"');
  } else {
    if (lang.length > 2) {
      lang = lang.toString().slice(1,3);
    }
  }

  res.render('app/views/getStarted/jade/' + lang + '/error404', {
    title: Configuration.get('general.siteName')
  });
};
