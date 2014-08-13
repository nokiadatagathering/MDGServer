define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, $base64, $rootScope, profileManager, errorsManager) {

    $scope.errors = {};

    $scope.signIn = function () {
      profileManager.login($scope.username, $base64.encode($scope.password)).then(
        function success () {
          $rootScope.goState('page.surveys');
        },

        function failed (err) {
          if (err.status === 401) {
            $scope.errorAuth = true;
            $scope.authErrorText = err.data.message;
          }

          console.error('error auth');
        }
      );
    };

    $scope.addFieldsErrors = function () {
      var fields = {
        login: ['errorAuth']
      };

      _.map(_.pairs(fields), function (field) {
        $scope.errors[field[0]] = errorsManager.getFieldErrorsHtml(field[0], field[1], 'loginForm');
      });
    };

    $scope.addFieldsErrors();
  };
});
