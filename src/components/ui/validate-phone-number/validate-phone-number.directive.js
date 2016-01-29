angular.module('mdg.ui.validatePhoneNumber', [])
  .directive('validatePhoneNumber',
  function ($parse) {
    'use strict';
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, iElement, iAttrs) {
        scope.$watch(iAttrs.ngModel, function (value) {
          scope.errorPhoneMinLength = false;
          scope.errorPhoneMaxLength = false;

          if (!value) {
            return;
          }

          $parse(iAttrs.ngModel).assign(scope, value.toString().replace(new RegExp("[^0-9]", 'g'), ''));

          var currentValue = scope[iAttrs.ngModel.split('.')[0]][iAttrs.ngModel.split('.')[1]];
          if (currentValue.length > 0 && currentValue.length < 10) {
            scope.errorPhoneMinLength = true;
          } else if (currentValue.length > 15) {
            scope.errorPhoneMaxLength = true;
          }
        });
      }
    };
  }
);