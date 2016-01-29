(function () {
  'use strict';
  angular.module('mdg.app.results').controller('resultsDetailsController',
    function ($scope, $http, $location, $window, resultsService, $stateParams) {
    $scope.result = {};

    $scope.getResultDetails = function (surveyId, resultId) {
      resultsService.resultDetails(surveyId, resultId).then(
        function success (config) {
          $scope.result = config.data;
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getResultDetails($stateParams.surveyId, $stateParams.resultId);
  });
})();
