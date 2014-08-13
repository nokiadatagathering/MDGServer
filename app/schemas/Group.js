var
  mongoose = require('mongoose'),
  ownerPlugin =   require('./plugins/owner'),
  Schema;

Schema =  new mongoose.Schema({
  name: {
    type: String,
    index: true,
    required: true
  }
});

Schema.plugin(ownerPlugin);

module.exports = Schema;
