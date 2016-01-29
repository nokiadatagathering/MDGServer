(function () {
  'use strict';

  angular.module('mdg.app.sync', [])
    .config(function ($stateProvider) {
      $stateProvider
        .state('page.surveys.sync', {
          url: '/sync',
          templateUrl: 'app/sync/sync.html',
          controller: 'SyncController'
        })
    });
})();
