(function () {
  'use strict';
  angular.module('mdg.app.results', [])
    .config(function ($stateProvider) {
      $stateProvider

        .state('page.results', {
          url: '/survey:{surveyId}',
          templateUrl: 'app/results/results.html',
          abstract: true,
          controller: 'resultsController'
        })

        .state('page.results.list', {
          url: '',
          templateUrl: 'app/results/results.list.html'
        })
        .state('page.results.list.details', {
          url: '/result:{resultId}',
          templateUrl: 'app/results/details/results.details.html',
          controller: 'resultsDetailsController'
        })

        .state('page.results.list.sentto', {
          url: '',
          templateUrl: 'app/results/results.sent.html'
        })

        .state('page.results.list.details.sentto', {
          url: '',
          templateUrl: 'app/results/results.sent.html'
        })

        .state('page.results.list.exportschedule', {
          url: '',
          templateUrl: 'app/results/export/results.export.html',
          controller: 'resultsExportController'
        })
        .state('page.results.list.details.exportschedule', {
          url: '',
          templateUrl: 'app/results/export/results.export.html',
          controller: 'resultsExportController'
        })

        .state('page.results.list.resultschart', {
          url: '',
          controller: 'resultsChartController',
          templateUrl: 'app/results/chart/results.chart.html'
        })
        .state('page.results.list.details.resultschart', {
          url: '',
          controller: 'resultsChartController',
          templateUrl: 'app/results/chart/results.chart.html'
        })

        .state('page.results.map', {
          url: '/map',
          templateUrl: 'app/results/map/results.map.html',
          controller: 'resultsController'
        })
        .state('page.results.map.exportschedule', {
          url: '',
          templateUrl: 'app/results/export/results.export.html',
          controller: 'resultsExportController'
        })

        .state('page.results.map.sentto', {
          url: '',
          templateUrl: 'app/results/results.sent.html'
        });

    });
})();
