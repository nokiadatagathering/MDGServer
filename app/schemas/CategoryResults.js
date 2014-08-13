var
  mongoose = require('mongoose'),
  QuestionResults = require('./QuestionResults'),
  Schema;

Schema =  new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  _questionResults: {
    type: [ QuestionResults ]
  }
});

module.exports = Schema;
