var
  mongoose = require('mongoose'),

  ownerPlugin = require('./plugins/owner'),

  Category = require('./Category'),

  ValidationError = require('mongoose/lib/error/validation'),
  ValidatorError =  require('mongoose/lib/error/validator'),
  Schema;

Schema =  new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  published: {
    type: Boolean,
    required: true,
    default: false
  },
  archive: {
    type: Boolean,
    required: true,
    default: false
  },
  _creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  _categories: {
    type: [ Category ]
  },
  resultsCount: {
    type: Number,
    default: 0
  }
}, {
  toObject: { virtuals: true }
});

Schema.plugin(ownerPlugin);

Schema.pre('save', function (next) {
  var me = this;

  if (me.get('__v') === undefined) {
    me.published = false;
  }

  if (me.published && me.isModified('resultsCount') && !me.isModified('title') && !me.isModified('_categories')) {
    next();

    return;
  }

  if (me.get('__v') !== undefined &&
    (me.published !== me.isModified('published')) &&
    (!me.isModified('archive'))) {
    var error = new ValidationError(this);

    error.errors.published = new ValidatorError('published', 'Can not edit the published survey', me.published);
    next(error);

    return;
  }

  next();
});

Schema.pre('remove', function (next) {
  var me = this;

  if (me.published) {
    var error = new ValidationError(this);

    error.errors.published = new ValidatorError('published', 'Can not edit the published survey', me.published);
    next(error);

    return;
  }

  next();
});

module.exports = Schema;
