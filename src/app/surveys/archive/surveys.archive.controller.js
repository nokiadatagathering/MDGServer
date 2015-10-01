(function () {
  'use strict';

  angular.module('mdg.app.surveys')
    .controller('ArchiveController',
    function ($scope, archivedSurveys) {
      $scope.archivedSurveys = archivedSurveys;
      console.log('$scope.archivedSurveys', $scope.archivedSurveys)
    }
  )
})();
