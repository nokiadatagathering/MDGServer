(function () {
  'use strict';

angular.module('mdg.app.surveys')
  .controller('SurveysController',
  function ($scope, $location, $window, $rootScope, $state, $translate,
                                             surveysService, surveys) {
      $scope.surveys = surveys;

      $scope.predicate = 'dateCreated';
      $scope.reverse = true;
      $scope.deletedSurveys = [];
      $scope.surveyXML = null;
      $scope.fileTypeError = false;
      $scope.dropdownList = [
        { translateId: 'surveys.All', value: 'all' },
        { translateId: 'surveys.Published', value: 'published' },
        { translateId: 'surveys.Unpublished', value: 'unpublished' }
      ];

      $scope.select = [
        {label: 'All', value: ''},
        {label: 'Published', value: 'Published'},
        {label: 'Unpublished', value: 'Unpublished'}
      ];

      $scope.selectVal = $scope.select[0];

      $scope.dropdownSelect =  { translateId: 'surveys.All', value: 'all' };

      $scope.getSurveyList = function () {
        $rootScope.archive = false;

        if ($state.includes('page.surveys.archive')) {
          $rootScope.archive = true;
        }

        surveysService.surveyList($rootScope.archive).then(
          function success (result) {
            $scope.surveys = result;
          },

          function failed (err) {
            console.log("error:", err);
          });
      };

      $scope.duplicateSurvey = function (surveyId, surveyTitle) {
        surveysService.duplicateSurvey(surveyId).then(
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
        surveysService.downloadXML(surveyId);
      };

      $scope.archive = function (surveyId, surveyTitle, archive) {
        surveysService.archiveSurvey(surveyId).then(
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

        if (!surveysService.checkFileType($scope.surveyXML)) {
          $scope.fileTypeError = true;
          $rootScope.$broadcast('wrong_survey_type');
          $scope.$apply();
          return;
        }

        surveysService.uploadXML($scope.surveyXML, function (err) {
          if (err) {
            $rootScope.$broadcast('wrong_xml_format');
            $scope.$apply();
          } else {
            $scope.getSurveyList();
          }
        });
      };
  });
})();
