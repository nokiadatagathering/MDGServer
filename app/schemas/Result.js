var
  mongoose = require('mongoose'),

  ownerPlugin = require('./plugins/owner'),

  CategoryResults = require('./CategoryResults'),

  ValidationError = require('mongoose/lib/error/validation'),
  ValidatorError =  require('mongoose/lib/error/validator'),
  Schema;

Schema =  new mongoose.Schema({
  _survey: {
    type: mongoose.Schema.ObjectId,
    ref: 'Survey',
    required: true
  },
  _user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  deviceID: {
    type: String
  },
  instanceID: {
    type: String
  },
  count: {
    type: Number
  },
  geostamp: {
    type: String
  },
  timeStart: {
    type: Date,
    required: true
  },
  timeEnd: {
    type: Date,
    required: true
  },
  _categoryResults: {
    type: [ CategoryResults ]
  },
  timeCreated: {
    type: Date,
    default: Date.now
  }
}, {
  toObject: { virtuals: true }
});

Schema.plugin(ownerPlugin);

Schema.virtual('title').get(function () {
  return this.count ? this.instanceID + ' (' + this.count + ')' : this.instanceID;
});

module.exports = Schema;
