(function () {
  'use strict';

  angular.module('mdg.app.errorsService', [])
    .service('errorsService',function () {
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

        errText = "{{ 'errors." +  errName + "' | translate:'{ param:" +  '"' + param + '"' + " }' }}";

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
  });
})();
