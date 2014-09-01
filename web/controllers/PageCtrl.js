define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, $rootScope, $state) {
    $scope.dropdownList = [
      { text: 'Logout' },
      { text: 'Documentation', href: '/docs' },
      { text: 'Download the app', href: '/docs/install.html' }
    ];

    $scope.dropdownSelect = {};

    $scope.selectMenu = function (selected) {
      if (selected.text === "Logout") {
        $rootScope.logout();
      }
    };

    function getSyncPageState () {
      var state = 'page.';

      if ($state.includes('page.surveys')) {
        state = 'page.surveys';
      } else if ($state.includes('page.builder')) {
        state = 'page.builder';
      } else if ($state.includes('page.editsurvey')) {
        state = 'page.editsurvey';
      }

      return state + '.sync';
    }

    $scope.sync = function () {
      if ($state.includes('page.surveys') || $state.includes('page.builder') || $state.includes('page.editsurvey')) {
        $rootScope.goState(getSyncPageState());
      } else {
        $rootScope.offlineMode = false;
        localStorage.removeItem('offlineMode');
      }
    };
  };
});
