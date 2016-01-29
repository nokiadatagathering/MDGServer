(function () {
  'use strict';

  angular.module('mdg.app.users').controller('UserSmsController',
    function ($scope, $stateParams, $state,
              smsService) {

      $scope.smsText = '';
      $scope.sendSms = function () {
        smsService.sendSMStoUser($stateParams.userId, {sms: $scope.smsText}).then(
          function success(config) {
            $state.go('^');
          },

          function failed(err) {
            console.log("error:", err);
          });
      };
    });
})();