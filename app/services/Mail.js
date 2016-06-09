var
  sgTransport = require('nodemailer-sendgrid-transport'),
  nodemailer = require('nodemailer'),
  Configuration = require('../helpers/Configuration'),
  fs = require('fs'),
  os = require('os'),
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
    from: Configuration.get('mail.from.' + subject),
    to: params.user.email,
    subject: "Activate your account",
    html: html
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
    from: Configuration.get('mail.from.' + subject),
    to: params.subscription.email,
    subject: "MDG schedule export",
    html: html,
    attachments: [
      {
        filename: 'survey_' + params.subscription._survey._id + '.zip',
        content: new Buffer(params.data, 'binary')
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
    from: Configuration.get('mail.from.' + subject),
    to: params.email,
    subject: "MDG account report",
    html: html,
    attachments: [
      {
        filename: params.filename,
        content: params.data,
        contentType: 'application/vnd.ms-excel'
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
    link: params.url + '/home#/forgotPassword'
  });

  return {
    from: Configuration.get('mail.from.' + subject),
    to: params.email,
    subject: "Your MDG usernames",
    html: html
  };
}

function getOptionsForResetPasswordEmail (params, fileName, subject) {
  var
    compiledJade = compileJade(fileName),
    html;

  html = compiledJade({
    username: params.user.username,
    link: params.url + '/home#/resetPassword/' + params.user.resetPasswordToken
  });

  return {
    from: Configuration.get('mail.from.' + subject),
    to: params.user.email,
    subject: "MDG reset password link",
    html: html
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
    from: Configuration.get('mail.from.' + subject),
    to: params.user.email,
    subject: "MDG reset password confirmation",
    html: html
  };
}

exports.sendMail = function (params, subject) {
  var
    options = {
      auth: {
        api_user: Configuration.get('mail.transportOptions.user'),
        api_key: Configuration.get('mail.transportOptions.key')
      }
    },
    mailTransport = nodemailer.createTransport(sgTransport(options)),
    fileName = process.cwd() + Configuration.get('mail.' + subject),
    sendMailOptions = {};

  if (subject === 'registration') {
    sendMailOptions = getOptionsForRegistrationEmail(params, fileName, subject);
  }

  if (subject === 'subscription') {
    sendMailOptions = getOptionsForSubscriptionEmail(params, fileName, subject);
  }

  if (subject === 'report') {
    sendMailOptions = getOptionsForReportEmail(params, fileName, subject);
  }

  if (subject === 'resetPassword') {
    sendMailOptions = getOptionsForResetPasswordEmail(params, fileName, subject);
  }

  if (subject === 'forgotUsername') {
    sendMailOptions = getOptionsForForgotUsernameEmail(params, fileName, subject);
  }

  if (subject === 'passwordChanged') {
    sendMailOptions = getOptionsForPasswordChangedEmail(params, fileName, subject);
  }

  console.log('sendMailOptions', sendMailOptions);
  mailTransport.sendMail(sendMailOptions, function(err) {
    console.log('err', err);
    mailTransport.close();
  });


};
