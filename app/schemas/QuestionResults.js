var
  mongoose = require('mongoose'),
  Schema;

Schema =  new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  result: {
    type: Object
  }
});

module.exports = Schema;
