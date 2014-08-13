var
  mongoose = require('mongoose'),
  Schema = require('../schemas/ChartRequest');

module.exports = mongoose.model('ChartRequest', Schema);
