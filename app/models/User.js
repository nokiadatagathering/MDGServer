var
  mongoose = require('mongoose'),
  Schema = require('../schemas/User');

module.exports = mongoose.model('User', Schema);
