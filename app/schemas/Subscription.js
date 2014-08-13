var
  mongoose = require('mongoose'),
  ownerPlugin =   require('./plugins/owner'),

  UserService = require('../services/User'),
  Schema;

Schema =  new mongoose.Schema({
  _survey: {
    type: mongoose.Schema.ObjectId,
    ref: 'Survey'
  },
  _user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  wassent: {
    type: Boolean
  }
});

Schema.plugin(ownerPlugin);

Schema.pre('save', function (next) {
  var me = this;

  if (me.wassent === undefined){
    me.wassent = false;
  }

  next();
});

Schema.path('email').validate(function (email) {
  if (email) {
    return UserService.checkEmailFormat(email);
  }

  return true;
}, 'format');

module.exports = Schema;
