define(function () {
  'use strict';
  return function ($scope, $http, $stateParams, $base64, $rootScope, profileManager, errorsManager) {
    $scope.invalidToken = true;
    $scope.errors = {};

    $scope.checkResetPasswordToken = function () {
      profileManager.checkResetPasswordToken({ token: $stateParams.token }).then(
        function success () {
          $scope.invalidToken = false;
        },

        function failed (err) {
          console.error('err', err);
        }
      );

      $scope.done = true;
    };

    $scope.resetPassword = function () {
      if ($scope.resetPasswordForm.$error.required.length > 0) {
        _.each($scope.resetPasswordForm.$error.required, function (field) {
          $scope.resetPasswordForm[field].$error.required = true;
        });

        $('input.ng-pristine').addClass('ng-dirty').removeClass('ng-pristine');
      } else if ($('.error-message:not(.ng-hide)').length === 0) {
        profileManager.resetPassword({ token: $stateParams.token, password: $base64.encode($scope.password) }).then(
          function success () {
            $rootScope.goState('pageGetStarted.login');
          },

          function failed (err) {
            $scope.invalidToken = true;
            console.error('err', err);
          }
        );
      }
    };

    $scope.addFieldsErrors = function () {
      var fields = {
        password: [{ minlength: 8 }, { maxlength: 20 }, 'required']
      };

      _.map(_.pairs(fields), function (field) {
        $scope.errors[field[0]] = errorsManager.getFieldErrorsHtml(field[0], field[1], 'resetPasswordForm');
      });
    };

    $scope.addFieldsErrors();

    $scope.checkResetPasswordToken();
  };
});
