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
            _($scope.langauges).each(function(lang) {
              //lang.href = '#'
              lang.tabindex = "0"
            });
            console.log('$scope.langauges', $scope.langauges);
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

      function getSyncPageState() {
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
          $state.go(getSyncPageState());
        } else {
          $rootScope.offlineMode = false;
          localStorage.removeItem('offlineMode');
        }
      };
    });
})();
