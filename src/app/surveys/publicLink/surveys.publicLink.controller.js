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
        if (resp.data && resp.data.publicUrl) {
          $scope.public.url = resp.data.publicUrl;
          $scope.public.customMessage = resp.data.customMessage;
          $scope.public.customLogoLink = resp.data.customLogoLink;
          $scope.public.expireDate = resp.data.expire ? $filter('date')(resp.data.expire, 'dd/MM/yyyy') : null;
          $scope.public.checked = true;
        }
      });

      $scope.makeSurveyPublic = function (survey, expireDate, customMessage) {
        var data = {};

        data.expire = $scope.public.checked ? expireDate : null;
        data.customMessage = customMessage;

        if ($scope.customLogo) {
          data.logo = $scope.customLogo;
        }

        surveysService.makeSurveyPublic(survey, data).then(function (resp) {
          if (resp.data.expire) {
            $scope.public.url = resp.data.publicUrl;
            $scope.public.customMessage = resp.data.customMessage;
            $scope.public.expireDate = $filter('date')(resp.data.expire, 'dd/MM/yyyy');

            if (!$scope.survey.published) {
              $scope.survey.published = true;

              $rootScope.$broadcast('publish_survey', $scope.survey.title);
            }
          } else {
            $scope.public.url = null;
            $scope.public.expireDate = null;
          }
        });
      };

      $scope.$watch(function () {
        return $scope.customLogo;
      }, function (logo) {
        if (!logo) {
          return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
          $scope.$evalAsync(function () {
            $scope.public.customLogoLink = e.target.result;
          });
        };
        reader.readAsDataURL(logo);
      });
    });
})();
