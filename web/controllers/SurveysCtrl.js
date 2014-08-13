define (function () {
    'use strict';
    return function ($scope, $http, $location, $window, $rootScope, $state, surveysManager) {

      $scope.surveys = {};
      $scope.predicate = 'dateCreated';
      $scope.reverse = true;
      $scope.deletedSurveys = [];
      $scope.surveyXML = null;
      $scope.fileTypeError = false;
      $scope.dropdownList = [
        { text: 'All' },
        { text: 'Published' },
        { text: 'Unpublished' }
      ];
      $scope.dropdownSelect = { text: 'All' };

      $scope.getSurveyList = function () {
        $rootScope.archive = false;

        if ($state.includes('page.archive')) {
          $rootScope.archive = true;
        }

        surveysManager.surveyList($rootScope.archive).then(
          function success (config) {
            $scope.surveys = config.data;
          },

          function failed (err) {
            console.log("error:", err);
          });
      };

      $scope.duplicateSurvey = function (surveyId, surveyTitle) {
        surveysManager.duplicateSurvey(surveyId).then(
          function success (config) {
            $rootScope.$broadcast('duplicate_survey', surveyTitle);
            $scope.getSurveyList();
          },

          function failed (err) {
            console.log("error:", err);
          });
      };

      $scope.deleteSurvey = function (survey) {
        $rootScope.deletedItems.surveys.push(survey._id);
        $rootScope.$broadcast('deleted_survey', survey._id, survey.title);
      };

      $scope.downloadSurvey = function (surveyId) {
        surveysManager.downloadXML(surveyId);
      };

      $scope.archive = function (surveyId, surveyTitle, archive) {
        surveysManager.archiveSurvey(surveyId).then(
          function success (config) {
            if (archive) {
              $rootScope.$broadcast('archive_survey', surveyTitle);
            } else {
              $rootScope.$broadcast('restore_survey', surveyTitle);
            }

            $scope.getSurveyList();
          },

          function failed (err) {
            console.log("error:", err);
          });
      };

      $scope.uploadSurvey = function () {
        if (!$scope.surveyXML) {
          return;
        }

        if (!surveysManager.checkFileType($scope.surveyXML)) {
          $scope.fileTypeError = true;
          $rootScope.$broadcast('wrong_survey_type');
          $scope.$apply();
          return;
        }

        surveysManager.uploadXML($scope.surveyXML, function (err) {
          if (err) {
            $rootScope.$broadcast('wrong_xml_format');
            $scope.$apply();
          } else {
            $scope.getSurveyList();
          }
        });
      };

      $scope.getSurveyList();
    };
});
