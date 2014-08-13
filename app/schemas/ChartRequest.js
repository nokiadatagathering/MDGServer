var
  mongoose = require('mongoose'),
  Schema;

Schema =  new mongoose.Schema({
  body: {
    type: Object,
    required: true
  }
});

module.exports = Schema;
