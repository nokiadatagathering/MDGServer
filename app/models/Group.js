var
  mongoose = require('mongoose'),
  Schema = require('../schemas/Group');

module.exports = mongoose.model('Group', Schema);
