define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, $rootScope, $translate, $filter, profileManager) {
    $scope.dropdownList = [
      { translateId: 'header.Logout', value: 'logout' },
      { translateId: 'header.Documentation', href: '/docs' },
      { translateId: 'header.Download_app', href: '/docs/install.html' }
    ];

    $scope.dropdownSelect = {};

    $scope.selectMenu = function (selected) {
      if (selected.value === "logout") {
        $rootScope.logout();
      }
    };

    $scope.langauges = [];

    $scope.getLanguages = function () {
      profileManager.getLanguages().then(
        function success (config) {
          $scope.langauges = config.data.languages;

          if (!$translate.use()) {
            $translate.use(config.data.preferred);
          }
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getLanguages();

    $scope.changeLanguage = function (selected) {
      $translate.use(selected.value);
    };
  };
});
