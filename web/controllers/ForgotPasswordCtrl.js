define(function () {
  'use strict';
  return function ($scope, $http, $location, profileManager) {

    $scope.forgotPassword = function () {
      profileManager.forgotPassword({ username: $scope.username, email: $scope.email }).then(
        function success () {
        },

        function failed (err) {
          console.error('err', err);
        }
      );

      $scope.done = true;
    };
  };
});
