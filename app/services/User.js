var User = require('../models/User');

exports.checkPhoneNumberFormat = function (phone) {
  var phoneRe = new RegExp("^\\+?[0-9\\-\\()\\s]+$", 'g');

  if (!phoneRe.test(phone)) {
    return false;
  }

};

exports.checkPhoneNumberLength = function (phone) {
  if (phone && (phone.toString().length < 10 || phone.toString().length > 15)) {
    return false;
  }

  return true;
};

exports.checkEmailFormat = function (email) {
  var emailRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$");
  return emailRegex.test(email);
};
