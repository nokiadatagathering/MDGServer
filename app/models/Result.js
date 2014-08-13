var
  mongoose = require('mongoose'),
  Schema = require('../schemas/Result');

module.exports = mongoose.model('Result', Schema);
