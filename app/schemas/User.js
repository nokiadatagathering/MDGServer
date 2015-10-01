var
  crypto = require('crypto'),
  mongoose = require('mongoose'),
  generatePassword = require('password-generator'),
  ownerPlugin =   require('./plugins/owner'),

  ValidationError = require('mongoose/lib/error/validation'),
  ValidatorError =  require('mongoose/lib/error/validator'),

  Survey = require('./Survey'),

  UserService = require('../services/User'),
  Schema;

Schema =  new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    set: toLower
  },
  phone: {
    type: String,
    required: true,
    set: setPhone
  },
  permission: {
    type: String,
    required: true,
    enum: [ 'superAdmin', 'admin', 'operator', 'fieldWorker' ]
  },
  country: {
    type: String
  },
  company: {
    type: String
  },
  industry: {
    type: String
  },
  _group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group'
  },
  timeCreated: {
    type: Date,
    default: Date.now
  },
  activatedCode: {
    type: String
  },
  activated: {
    type: Boolean,
    default: false
  },
  _surveys: {
    type: Object,
    default: {}
  },
  deleted: {
    type: Boolean,
    default: false
  },
  encrypted: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  toObject: { virtuals: true }
});

Schema.plugin(ownerPlugin);

Schema.pre('save', function (next) {
  var
    me = this,
    error;

  if (me.permission === 'fieldWorker') {
    me.email = undefined;
  }

  if (!me.isModified('_group') && (me.permission !== 'fieldWorker') && !me.email) {
    error = new ValidationError(me);

    error.errors.published = new ValidatorError('email', 'This field is required', me.email);
    next(error);

    return;
  }

  if (me.isModified('username') && !me.isModified('password')) {
    error = new ValidationError(me);

    error.errors.published = new ValidatorError('password', 'This field is required');
    next(error);

    return;
  }

  if (me.get('__v') === undefined && me.permission === 'superAdmin') {
    me.activatedCode = generatePassword(20, false);
  }

  if (me.get('__v') === undefined && me.permission !== 'superAdmin') {
    me.activated = true;
  }

  if (!me.encrypted && me.isModified('encrypted')) {
    me.encrypted = true;
  }

  if (me.isModified('password') || me.isModified('encrypted')) {
    me.setPassword();
  }

  next();
});

Schema.methods.encryptPassword = function (password) {
  var md5Hash = crypto.createHash('md5');
  return md5Hash.update(this.username + ':NDG:' + new Buffer(password, 'base64').toString('ascii')).digest("hex");
};

Schema.methods.checkPassword = function (password, cb) {
  cb(null, this.password === this.encryptPassword(password));
};

Schema.methods.setPassword = function () {
  this.password = this.encryptPassword(this.password);
  this.encrypted = true;
};

Schema.methods.setResetPasswordToken = function () {
  this.resetPasswordToken = generatePassword(20, false);
  this.resetPasswordExpires = Date.now() + 360000;
};

Schema.virtual('owner').get(function () {
  return this._owner ? this._owner : this._id;
});

Schema.virtual('name').get(function () {
  return this.firstName + ' ' + this.lastName;
});

Schema.path('password').validate(function (password) {
  if (new Buffer(password, 'base64').toString('ascii').length < 8) {
    return false;
  }

  return true;
}, 'format');

Schema.path('phone').validate(function (phone) {
  return UserService.checkPhoneNumberLength(phone);
}, 'format');

Schema.path('country').validate(function (country) {
  if (this.permission === 'superAdmin' && !country) {
    return false;
  }

  return true;
}, 'This field is required');

Schema.path('industry').validate(function (industry) {
  if (this.permission === 'superAdmin' && !industry) {
    return false;
  }

  return true;
}, 'This field is required');

Schema.path('company').validate(function (company) {
  if (this.permission === 'superAdmin' && !company) {
    return false;
  }

  return true;
}, 'This field is required');

function setPhone (phone) {
  if (UserService.checkPhoneNumberFormat(phone)) {
    return phone.replace(new RegExp("[^0-9]", 'g'), '');
  }

  return phone;
}

function toLower (value) {
  return value.toLowerCase();
}

module.exports = Schema;
