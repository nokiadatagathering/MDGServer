var
  directTransport = require('nodemailer-direct-transport'),
  smtpTransport = require('nodemailer-smtp-transport'),
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
    generateTextFromHTML: true,
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
    generateTextFromHTML: true,
    html: html,
    attachments: [
      {
        fileName: 'survey_' + params.subscription._survey._id + '.zip',
        contents: new Buffer(params.data, 'binary')
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
    generateTextFromHTML: true,
    html: html,
    attachments: [
      {
        fileName: params.filename,
        contents: params.data,
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
    generateTextFromHTML: true,
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
    generateTextFromHTML: true,
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
    generateTextFromHTML: true,
    html: html
  };
}

exports.sendMail = function (params, subject) {
  var
    mailTransport = nodemailer.createTransport(smtpTransport({})),
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
