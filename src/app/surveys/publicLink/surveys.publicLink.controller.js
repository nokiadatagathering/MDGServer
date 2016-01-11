(function () {
  'use strict';
  angular.module('mdg.app.surveys')
    .controller('SurveyPublicLinkController',
    function ($scope, $rootScope, $stateParams, $filter, surveysService) {

      $('#expire-date').datepicker({
        dateFormat: 'dd/mm/yy',
        defaultDate: '+0d'
      });

      new Clipboard('#linkcopy');

      $scope.public = {};

      $scope.survey = $scope.$parent.filtered.find(function (survey) {
        return survey.id === $stateParams.surveyId;
      });

      surveysService.getPublicLink($stateParams.surveyId).then(function (resp) {
        $scope.public.url = resp.data.publicUrl;

        if (resp.data.expire) {
          $scope.public.expireDate = resp.data.expire ? $filter('date')(resp.data.expire, 'dd/MM/yyyy') : null;
          $scope.public.checked = true;
        }
      });

      $scope.makeSurveyPublic = function (survey, expireDate) {
        if (!$scope.public.checked) {
          expireDate = null;
        }

        surveysService.makeSurveyPublic(survey, expireDate).then(function (resp) {
          if (resp.data.expire) {
            $scope.public.url = resp.data.publicUrl;
            $scope.public.expireDate = $filter('date')(resp.data.expire, 'dd/MM/yyyy');

            if (!$scope.survey.published) {
              $scope.survey.published = true;

              $rootScope.$broadcast('publish_survey', $scope.survey.title);
            }
          } else {
            $scope.public.expireDate = null;
          }
        });
      }
    });
})();
