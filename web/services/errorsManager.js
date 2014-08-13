define(function () {
  'use strict';
  return function () {
    var allErrors = {
      minlength: ' This field must have at least $ characters.',
      maxlength: ' This field cannot be longer than $ characters.',
      required: ' This field cannot be blank.',
      pattern: 'This field should contain only digits.',
      email: 'This is not a valid email.',
      errorEmailPattern: 'This is not a valid email.',
      errorAuth: '{{authErrorText}}',
      errorLogin: 'This login is already used.',
      errorPassword: 'Username has been changed, please fill PASSWORD and CONFIRM PASSWORD fields.',
      errorLoginPattern: 'Login can contain only numbers, periods and Latin letters.',
      errorUsernamePattern: 'Nickname can contain only numbers, periods and Latin letters.',
      errorExistingEmail: 'This email is already used.',
      errorExistingUsername: 'This username is already used.',
      errorExistingGroupName: 'This group name is already used.',
      errorPhoneMaxLength: ' This field cannot be longer then 15 characters.',
      errorPhoneMinLength: ' This field must have at least 10 characters.',
      errorGroupName: 'This group name is already used.'
    };

    function getFieldErrorsHtml (field, fieldErrs, form) {
      var fieldErrsHtml = '';
      _.map(fieldErrs, function (err) {
        var
          errName = err,
          param = '',
          errText;

        if (err instanceof Object) {
          errName = _.pairs(err)[0][0];
          param = _.pairs(err)[0][1];
        }

        errText = allErrors[errName].replace('$', param);

        if (err === 'required') {
          fieldErrsHtml += '<span class="error-message ng-hide" ng-show="' + form + '.' + field + '.$dirty && ' + form + '.' + field + '.$error.required">' + errText + '</span>';
        } else if (/(e|E)rror/.test(errName)) {
          fieldErrsHtml += '<span class="error-message ng-hide" ng-show="' + errName + '">' + errText + '</span>';
        } else {
          fieldErrsHtml += '<span class="error-message ng-hide" ng-show="' + form + '.' + field + '.$error.' + errName + '">' + errText + '</span>';
        }
      });

      return fieldErrsHtml;
    }

    return {
      getFieldErrorsHtml: getFieldErrorsHtml
    };
  };
});
