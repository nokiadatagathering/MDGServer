define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, resultsManager, $stateParams) {
    $scope.result = {};

    $scope.getResultDetails = function (surveyId, resultId) {
      resultsManager.resultDetails(surveyId, resultId).then(
        function success (config) {
          $scope.result = config.data;
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getResultDetails($stateParams.surveyId, $stateParams.resultId);
  };
});
