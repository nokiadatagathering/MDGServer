var
  mongoose = require('mongoose'),
  Schema = require('../schemas/Subscription');

module.exports = mongoose.model('Subscription', Schema);
