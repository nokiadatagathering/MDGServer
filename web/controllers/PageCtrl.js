define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, $rootScope, profileManager) {
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
  };
});
