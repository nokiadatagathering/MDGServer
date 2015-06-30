var
  express = require('express'),
  resource = require('express-resource-new'),
  cronJob = require('cron').CronJob,
  passport = require('passport'),
  mongoose = require('mongoose'),
  http = require('http'),
  https = require('https'),

  multipart = require('connect-multiparty'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),

  colors = require('colors'),
  MongoStore = require('connect-mongo')(express),

  Configuration = require('./app/helpers/Configuration'),
  ErrorHandler = require('./app/helpers/ErrorHandler'),

  loginCntr = require('./app/controllers/web/login'),
  passwordResetCntr = require('./app/controllers/web/passwordReset'),
  autocompleteCntr = require('./app/controllers/web/autocomplete'),
  smsCntr = require('./app/controllers/web/sms'),
  xmlCntr = require('./app/controllers/web/xml'),
  duplicateCntr = require('./app/controllers/web/duplicate'),
  archiveCntr = require('./app/controllers/web/archive'),
  sendSurveyCntr = require('./app/controllers/web/sendSurvey'),
  chartCntr = require('./app/controllers/web/chart'),
  resultsImageCntr = require('./app/controllers/web/resultsImage'),
  exportCntr = require('./app/controllers/web/export'),
  validationsCntr = require('./app/controllers/web/validations'),
  monthlyReportCntr = require('./app/controllers/web/monthlyReport'),
  getStartedCntr = require('./app/controllers/web/getStarted'),

  manifestCntr = require('./app/controllers/web/manifest'),

  checkAuthorizationCntr = require('./app/controllers/mobile/checkAuthorization'),
  checkServerCntr = require('./app/controllers/mobile/checkServer'),
  postResultsCntr = require('./app/controllers/mobile/postResults'),
  receiveSurveyCntr = require('./app/controllers/mobile/receiveSurvey'),
  localeCntr = require('./app/controllers/mobile/locale'),

  fs = require('fs'),

  ACLService = require('./app/services/ACL'),
  EncryptionService = require('./app/services/Encryption'),
  Subscription = require('./app/services/Subscription'),
  Export = require('./app/services/Export'),

  version,
  db,

  app, server, httpsOptions = {};


try {
  version = require('./version').version
} catch (e) {
  version = 'dev';
}

//additional windows stuff
if (process.platform === 'win32') {
  try {
    var windowsHelper = require('./app/helpers/windows');
    if (process.argv[2] === '--install') {
      windowsHelper.install();
	  return;
    }

    if (process.argv[2] === '--uninstall') {
      windowsHelper.uninstall();
	  return;
    }
  } catch(e) {}

}


exports.run = function (mongoUrl, port, callback) {

  app = express();
  app.enable('trust proxy');
  require('./app/services/Auth');

  app.set('views', __dirname);
  app.set('view engine', 'jade');
  app.set('controllers', __dirname + '/app/controllers/web');
  if (app.settings.env === 'production') {
    app.use(express.compress());
  }

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  if (app.settings.env !== 'testing') {
    app.use(express.logger({immediate: true}));
  }

  app.use(cookieParser());

  var sessionStore = new MongoStore({ url: Configuration.get('general.mongodbUrl') });

  app.use(express.session({
    store: sessionStore,
    secret: 'secret'
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(multipart());
  app.use(methodOverride());

  if (app.settings.env === 'development') {
    app.use(express.static(__dirname + '/.tmp'));
    app.use('/src', express.static(__dirname + '/src'));
    app.use('/.tmp', express.static(__dirname + '/.tmp'));
    app.use('/bower_components', express.static(__dirname + '/bower_components'));
  }

  if (app.settings.env === 'production') {
    app.use(express.static(__dirname + '/dist'));
  }

  app.use(app.router);
  app.use(ErrorHandler);
  app.use(getStartedCntr.error404);

  mongoose.connect(mongoUrl);
  db = mongoose.connection;

  db.on('error', function () {
    throw new Error('Unable to connect to MongoDB at ' + mongoUrl);
  });

  db.on('connected', function () {
    console.log(('Connected to MongoDB at ' + mongoUrl).cyan);

    app.get('/activate/:code', loginCntr.activate);
    app.post('/login', loginCntr.login);
    app.get('/logout', loginCntr.logout);
    app.get('/checkAuthorization', checkAuthorizationCntr.checkAuthorization);
    app.get('/autocomplete/company', autocompleteCntr.getCompanies);
    app.get('/autocomplete/industry', autocompleteCntr.getIndustries);

    app.post('/signup', loginCntr.signup);

    app.get('/userPermission', ACLService.checkPermission, loginCntr.permission);
    app.post('/sms/:type/:id', ACLService.checkPermission, smsCntr.sendSms);
    app.post('/xml', ACLService.checkPermission, xmlCntr.import);
    app.get('/xml/:id', ACLService.checkPermission, xmlCntr.export);
    app.post('/export/:id', ACLService.checkPermission, exportCntr.export);
    app.post('/duplicate/:id', ACLService.checkPermission, duplicateCntr.duplicate);
    app.post('/archive/:id', ACLService.checkPermission, archiveCntr.archive);
    app.post('/sendSurvey/:id', ACLService.checkPermission, sendSurveyCntr.publish);
    app.post('/chartData', ACLService.checkPermission, chartCntr.getChartData);
    app.post('/chartUrl', ACLService.checkPermission, chartCntr.getChartUrl);
    app.get('/chartImage/:id', ACLService.checkPermission, chartCntr.getChartImage);
    app.get('/resultsImage/:filename', ACLService.checkPermission, resultsImageCntr.getImage);
    app.post('/validate/:id', validationsCntr.checkUniqueUserField);
    app.get('/CheckUrl', checkServerCntr.checkServer);
    app.post('/PostResults', passport.authenticate('digest', { session: false }), postResultsCntr.postResults);
    app.get('/ReceiveSurvey', passport.authenticate('digest', { session: false }), receiveSurveyCntr.index);
    app.get('/ReceiveSurvey/:id', passport.authenticate('digest', { session: false }), receiveSurveyCntr.show);
    app.get('/LocalizationServing/text', localeCntr.getLocale);
    app.get('/LanguageList', localeCntr.languageList);

    app.get('/monthlyReport', passport.authenticate('basic', { session: false }), monthlyReportCntr.getReportPage);
    app.post('/monthlyReport', passport.authenticate('basic', { session: false }), monthlyReportCntr.sendReport);

    app.post('/forgotPassword', passwordResetCntr.forgotPassword);
    app.post('/resetPassword/:token', passwordResetCntr.resetPassword);

    app.get('/supportedLanguages', getStartedCntr.languages);

    app.resource('users');
    app.resource('groups');
    app.resource('surveys', function() {
      this.resource('results');
      this.resource('subscriptions');
    });

    app.get('/home', getStartedCntr.home);

    app.get('/', function (req, res) {
      console.log('------------------req.user      ', req.user);
      if (req.method === 'HEAD') {
        res.send();
      } else {
        if (req.user) {

          if (app.settings.env === 'production') {
            app.get('/mdgcache.manifest', manifestCntr.getManifest);

            res.render('dist/index', {
              title: Configuration.get('general.siteName'),
              version: version,
              manifest: 'mdgcache.manifest'
            });
          } else {
            app.get('/mdgcache-dev.manifest', manifestCntr.getManifest);

            res.render('.tmp/serve/index', {
              title: Configuration.get('general.siteName'),
              version: version,
              manifest: 'mdgcache-dev.manifest'
            });
          }

        } else {
          console.log(('redirect').yellow);
          res.redirect('/home');
        }
      }
    });


    if (Configuration.get('general.protocolType') === 'https') {
      httpsOptions.pfx = fs.readFileSync(Configuration.get('general.httpspfx'));
      httpsOptions.passphrase = Configuration.get('general.httpspassphrase');

      server = https.createServer(httpsOptions, app).listen(port, callback);
    } else {
      server = http.createServer(app).listen(port, callback);
    }

    EncryptionService.encryptPasswords();

    new cronJob('0 1 0 * * *', function () {
      Subscription.sendSubscriptionEmail();
    }, null, true);

    new cronJob('0 1 0 1 * *', function () {
      Export.exportUserRegistrations();
    }, null, true);
  });
};

if (!module.parent) {
  exports.run(Configuration.get('general.mongodbUrl'), process.env.PORT || Configuration.get('general.port'), function () {
    console.log(('Microsoft Data Gathering server listening on port ' + server.address().port + ' in ' + app.settings.env + ' mode').cyan);
  });
}
