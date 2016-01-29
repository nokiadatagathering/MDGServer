(function () {
  'use strict';

  angular.module('mdg.app.page', [])
    .controller('PageController',
    function ($scope, $http, $location, $window, $rootScope, $state, $translate, $filter, authorizationService) {
      $scope.dropdownList = [
        {translateId: 'header.Logout', value: 'logout'},
        {translateId: 'header.Documentation', href: '/docs'},
        {translateId: 'header.Download_app', href: '/docs/install.html'}
      ];

      $scope.dropdownSelect = {};

      $scope.selectMenu = function (selected) {
        if (selected.value === "logout") {
          $rootScope.logout();
        }
      };

      $scope.langauges = [];

      $scope.getLanguages = function () {
        authorizationService.getLanguages().then(
          function success(config) {
            $scope.langauges = config.data.languages;
            if (!$translate.use()) {
              $translate.use(config.data.preferred);
            }
          },

          function failed(err) {
            console.log("error:", err);
          });
      };

      $scope.getLanguages();

      $scope.changeLanguage = function (selected) {
        $translate.use(selected.value);
      };

      $scope.sync = function () {
        if ($state.includes('page.surveys')) {
          $state.go('page.surveys.sync');
        } else {
          $rootScope.offlineMode = false;
          localStorage.removeItem('offlineMode');
        }
      };
    });
})();
