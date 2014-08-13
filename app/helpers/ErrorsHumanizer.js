var
  _ = require('underscore'),

  isValidatorError,
  isValidationError,
  isMongoError,
  isCastError,
  isPermissionError,

  humanizeValidatorError,
  humanizeValidationError,
  humanizeMongoError,
  humanizeCastError,
  humanizePermissionError,

  humanizeError,

  validatorErrors = {
    required: 'This field is required',
    unique: 'This value is already used',
    format: 'Invalid field format',
    xmlFormat: 'XML is not well formed',
    unknown: 'Unknown entity',
    invalidVersion: 'Entity info has been already updated.',
    published: 'Can not edit the published survey',
    unpublished: 'Can not post results for unpublished survey'
  },

  permissionError = 'You do not have permission to perform given operation';

isValidatorError = function (error) {
  return error.name === 'ValidatorError';
};

isValidationError = function (error) {
  return error.name === 'ValidationError';
};

isMongoError = function (error) {
  return error.name === 'MongoError';
};

isCastError = function (error) {
  return error.name === 'CastError';
};

isPermissionError = function (error) {
  return error.name === 'PermissionError';
};

humanizeValidatorError = function (error) {
  var msg = error.message;

  if (validatorErrors[error.type]) {
    msg = validatorErrors[error.type];
  }

  return {
    path: error.path,
    message: msg
  };
};

humanizeValidationError = function (error) {
  return _.map(error.errors, humanizeValidatorError);
};

humanizeCastError = function (error) {
  error.type = 'format';
  return humanizeValidatorError(error);
};

humanizePermissionError = function () {
  return { message: permissionError };
};

humanizeMongoError = function (error) {
  if (error.code !== 11000 && error.code !== 11001) {
    return [ error ];
  }

  var path = /\$([A-z0-9_]+)_1/.exec(error.err)[1];

  return [{
    path: path,
    message: 'This ' + path + ' is already used'
  }];
};

humanizeError = function (error) {
  if (isValidatorError(error)) {
    return humanizeValidatorError(error);
  }

  if (isValidationError(error)) {
    return humanizeValidationError(error);
  }

  if (isMongoError(error)) {
    return humanizeMongoError(error);
  }

  if (isCastError(error)) {
    return humanizeCastError(error);
  }

  if (isPermissionError(error)) {
    return humanizePermissionError();
  }

  return error;
};

module.exports = function (errors) {
  if (!_.isArray(errors)) {
    errors = [ errors ];
  }

  return _.flatten(errors.map(humanizeError), true);
};
