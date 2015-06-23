(function () {
  'use strict';

  angular.module('mdg.app.users').controller('GroupSmsController',
    function ($scope, $stateParams,
              smsService) {

      $scope.smsText = '';
      $scope.sendSms = function () {
        smsService.sendSMStoGroup($stateParams.groupId, {sms: $scope.smsText}).then(
          function success(config) {
            $state.go('^');
          },

          function failed(err) {
            console.log("error:", err);
          });
      };
    });
})();