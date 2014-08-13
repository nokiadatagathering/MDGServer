var
  Configuration = require('../helpers/Configuration'),
  twilioClient;

if (Configuration.get('twilio.accountSid') && Configuration.get('twilio.authToken') && Configuration.get('twilio.phoneNumber')) {
  twilioClient = require('twilio')(Configuration.get('twilio.accountSid'), Configuration.get('twilio.authToken'));
}

exports.sendSms = function (text, phone) {
  if (twilioClient) {
    twilioClient.sendSms({
      to: '+' + phone,
      from: Configuration.get('twilio.phoneNumber'),
      body: text
    }, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
};
