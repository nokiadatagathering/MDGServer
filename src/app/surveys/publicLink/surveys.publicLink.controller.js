(function () {
  'use strict';
  angular.module('mdg.app.surveys')
    .controller('SurveyPublicLinkController',
    function ($scope, $stateParams, $filter, surveysService) {

      $('#expire-date').datepicker({
        dateFormat: 'dd/mm/yy',
        defaultDate: '+0d'
      });

      new Clipboard('#linkcopy');

      $scope.public = {};

      surveysService.getPublicLink($stateParams.surveyId).then(function (resp) {
        if (resp.data && resp.data.publicUrl) {
          $scope.public.url = resp.data.publicUrl;
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
          } else {
            $scope.public.url = null;
            $scope.public.expireDate = null;
          }
        });
      }
    });
})();
