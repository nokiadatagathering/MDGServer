(function () {
  'use strict';

  angular.module('mdg.app.surveys', [])
    .config(function ($stateProvider) {
      $stateProvider
        .state('page.surveys', {
          url: '/surveys',
          abstract: true,
          controller: 'SurveysController',
          resolve: {
            surveys: ['surveysService', '$rootScope', function (surveysService, $rootScope) {
              return surveysService.surveyList($rootScope.archive);
            }]
          },
          templateUrl: 'app/surveys/surveys.html'
        })
        .state('page.surveys.list', {
          url: '/list',
          templateUrl: 'app/surveys/surveys.list.html'

        })
        .state('page.surveys.list.sendsurvey', {
          url: '/send:{surveyId}',
          controller: 'SendSurveyController',
          templateUrl: 'app/surveys/send/surveys.send.html'
        })
        .state('page.surveys.new', {
          url: '/new',
          templateUrl: 'app/surveys/edit/surveys.edit.html',
          controller: 'SurveysEditController'

        })
        .state('page.surveys.edit', {
          url: '/edit:{surveyId}',
          templateUrl: 'app/surveys/edit/surveys.edit.html',
          controller: 'SurveysEditController'
        })
      .state('page.surveys.archive', {
        url: '/archive',
        templateUrl: 'app/surveys/archive/surveys.archive.html'
      })
      .state('page.surveys.archive.sendsurvey', {
        url: '/send:{surveyId}',
        templateUrl: 'app/surveys/send/surveys.send.html'
      })
    });
})();
