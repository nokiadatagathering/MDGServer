var
  mongoose = require('mongoose'),
  Schema = require('../schemas/Survey');

module.exports = mongoose.model('Survey', Schema);
