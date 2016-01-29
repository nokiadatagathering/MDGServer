angular.module('mdg.ui.nfEvent', [])
  .directive('nfEvent',
  function () {
    'use strict';
    return {
      restrict: 'AC',
      replace: true,
      require: '^notification',
      scope: {
        nfEvent: '='
      },
      controller: [
        '$scope', '$rootScope', '$element', '$attrs', '$timeout',
        'resultsService', 'usersService', 'groupsService', 'surveysService',
        function ($scope, $rootScope, $element, $attrs, $timeout,
                  resultsService, usersService, groupsService, surveysService) {
          $scope.nfEvent.show = true;
          $scope.nfEvent.time = $scope.nfEvent.time ? $scope.nfEvent.time : 10;

          var
            timerForDelete,
            counter = function () {
              $scope.nfEvent.time--;
              $timeout(counter, 1000);
            };

          $timeout(counter, 1000);

          //  Events actions
          $scope.deleteItem = function () {
            switch ($scope.nfEvent.type) {
              case 'deleted_result':
                $scope.nfEvent.resultIds.map(function (resultId) {
                  resultsService.deleteResult($scope.nfEvent.surveyId, resultId).then(
                    function success (config) {
                      var index = $rootScope.deletedItems.results.indexOf(resultId) + 1;
                      $rootScope.deletedItems.results = $rootScope.deletedItems.results.splice(index, 1);
                    },
                    function failed (err) {
                      console.log("error:", err);
                    });
                });
                break;
              case 'deleted_user':
                usersService.deleteUser($scope.nfEvent.eventId).then(
                  function success (config) {
                    $rootScope.$broadcast('update_users_count', $scope.nfEvent.eventId);
                    var index = $rootScope.deletedItems.users.indexOf($scope.nfEvent.eventId) + 1;
                    $rootScope.deletedItems.users = $rootScope.deletedItems.users.splice(index, 1);
                  },

                  function failed (err) {
                    console.log("error:", err);
                  });
                break;
              case 'deleted_group':
                groupsService.deleteGroup($scope.nfEvent.eventId).then(
                  function success (config) {
                    var index = $rootScope.deletedItems.groups.indexOf($scope.nfEvent.eventId) + 1;
                    $rootScope.deletedItems.groups = $rootScope.deletedItems.groups.splice(index, 1);
                  },

                  function failed (err) {
                    console.log("error:", err);
                  });
                break;
              case 'deleted_survey':
                surveysService.deleteSurvey({ id: $scope.nfEvent.eventId }).then(
                  function success (config) {
                    var index = $rootScope.deletedItems.surveys.indexOf($scope.nfEvent.eventId) + 1;
                    $rootScope.deletedItems.surveys = $rootScope.deletedItems.surveys.splice(index, 1);
                  },

                  function failed (err) {
                    console.log("error:", err);
                  });
                break;
            }
            $scope.nfEvent.show = false;
          };

          timerForDelete = $timeout($scope.deleteItem, $scope.nfEvent.time * 1000);

          $scope.cancelTimeout = function (action) {
            var index;

            if (action === 'Undo') {
              if ($scope.nfEvent.resultIds) {
                $scope.nfEvent.resultIds.map(function (resultId) {
                  $('#' + resultId).slideDown();

                  index = $rootScope.deletedItems.results.indexOf(resultId) + 1;
                  $rootScope.deletedItems.results = $rootScope.deletedItems.results.splice(index, 1);
                });
              } else {
                index = $rootScope.deletedItems[$scope.nfEvent.name].indexOf($scope.nfEvent.eventId) + 1;
                $rootScope.deletedItems[$scope.nfEvent.name] = $rootScope.deletedItems[$scope.nfEvent.name].splice(index, 1);
              }
            }

            $('#' + $scope.nfEvent.eventId).slideDown();
            $timeout.cancel(timerForDelete);
            $scope.nfEvent.show = false;
          };
        }
      ],
      template: '<div ng-show="nfEvent.show">' +
      '<span translate="{{nfEvent.label}}" translate-values="{{nfEvent.translateValues}}"></span>' +
      '<br>' +
      '<a ng-click="cancelTimeout(nfEvent.action)" href="">{{nfEvent.action}}{{nfEvent.hideCounter ? "" : "&nbsp;" + nfEvent.time}}</a>' +
      '</div>'
    };
});
