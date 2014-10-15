var
  mandrill = require('mandrill-api/mandrill'),
  Configuration = require('../helpers/Configuration'),
  mandrill_client = new mandrill.Mandrill(Configuration.get('mail.mandrillApiKey')),
  fs = require('fs'),
  jade = require('jade');

function compileJade (fileName) {
  return jade.compile(fs.readFileSync(fileName, 'utf8'), {
    filename: fileName,
    pretty: true
  });
}

function getOptionsForRegistrationEmail (params, fileName, subject) {
  var
    compiledJade = compileJade(fileName),
    html;

  html = compiledJade({
    name: params.user.firstName,
    username: params.user.username,
    link: params.url + '/activate/' + params.user.activatedCode
  });

  return {
    from_email: Configuration.get('mail.from.' + subject),
    to: [{ email: params.user.email }],
    subject: "Activate your account",
    html: html,
    important: true
  };
}

function getOptionsForSubscriptionEmail (params, fileName, subject) {
  var
    compiledJade = compileJade(fileName),
    html;

  html = compiledJade({
    surveyTitle: params.subscription._survey.title,
    from: params.subscription.from.toISOString().split('T')[0],
    to: params.subscription.to.toISOString().split('T')[0]
  });

  return {
    from_email: Configuration.get('mail.from.' + subject),
    to: [{ email: params.subscription.email }],
    subject: "MDG schedule export",
    html: html,
    important: true,
    attachments: [
      {
        type: 'application/octet-stream',
        name: 'survey_' + params.subscription._survey._id + '.zip',
        content: new Buffer(params.data, 'binary').toString('base64')
      }
    ]
  };
}

function getOptionsForReportEmail (params, fileName, subject) {
  var
    compiledJade = compileJade(fileName),
    html;

  html = compiledJade({
    month: params.month
  });

  return {
    from_email: Configuration.get('mail.from.' + subject),
    to: [{ email: params.email }],
    subject: "MDG account report",
    html: html,
    important: true,
    attachments: [
      {
        name: params.filename,
        content: new Buffer(params.data, 'binary').toString('base64'),
        type: 'application/vnd.ms-excel'
      }
    ]
  };
}

function getOptionsForForgotUsernameEmail (params, fileName, subject) {
  var
    compiledJade = compileJade(fileName),
    html;

  html = compiledJade({
    users: params.users,
    link: params.url + '/#/forgotPassword'
  });

  return {
    from_email: Configuration.get('mail.from.' + subject),
    to: [{ email: params.email }],
    subject: "Your MDG usernames",
    html: html,
    important: true
  };
}

function getOptionsForResetPasswordEmail (params, fileName, subject) {
  var
    compiledJade = compileJade(fileName),
    html;

  html = compiledJade({
    username: params.user.username,
    link: params.url + '/#/resetPassword/' + params.user.resetPasswordToken
  });

  return {
    from_email: Configuration.get('mail.from.' + subject),
    to: [{ email: params.user.email }],
    subject: "MDG reset password link",
    html: html,
    important: true
  };
}

function getOptionsForPasswordChangedEmail (params, fileName, subject) {
  var
    compiledJade = compileJade(fileName),
    date = new Date(),
    html;

  html = compiledJade({
    username: params.user.username,
    date: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
    time: date.getHours() + ':' + date.getMinutes()
  });

  return {
    from_email: Configuration.get('mail.from.' + subject),
    to: [{ email: params.user.email }],
    subject: "MDG reset password confirmation",
    html: html,
    important: true
  };
}

exports.sendMail = function (params, subject) {
  var
    fileName = process.cwd() + Configuration.get('mail.' + subject),
    message = {};

  if (subject === 'registration') {
    message = getOptionsForRegistrationEmail(params, fileName, subject);
  }

  if (subject === 'subscription') {
    message = getOptionsForSubscriptionEmail(params, fileName, subject);
  }

  if (subject === 'report') {
    message = getOptionsForReportEmail(params, fileName, subject);
  }

  if (subject === 'resetPassword') {
    message = getOptionsForResetPasswordEmail(params, fileName, subject);
  }

  if (subject === 'forgotUsername') {
    message = getOptionsForForgotUsernameEmail(params, fileName, subject);
  }

  if (subject === 'passwordChanged') {
    message = getOptionsForPasswordChangedEmail(params, fileName, subject);
  }

  mandrill_client.messages.send({ message: message, async: false }, function (result) {
  }, function (e) {
    console.log('A mandrill error occurred: ', e.name, e.message);
  });
};
