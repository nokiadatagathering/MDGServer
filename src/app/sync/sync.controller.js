(function () {
  'use strict';

  angular.module('mdg.app.sync')
    .controller('SyncController',
    function ($scope, $http, $location, $window, $state, $rootScope, syncService, surveysService) {
      $scope.requestsInConflict = [];

      var
        request,
        db = openDatabase('ndg', '1.0', 'NDG', 2 * 1024 * 1024),
        requestSyncComplete = function (request) {
          db.transaction(function (tx) {
            tx.executeSql("DELETE FROM requests WHERE id == ?", [request.id], function (tx, result) {
            });
            console.log('request.id', request.id);
          });
        };

      $scope.Sync = function () {
        db.transaction(function (tx) {
          tx.executeSql("SELECT * FROM requests", [], function (tx, result) {
            $rootScope.offlineMode = false;
            $scope.failedSync = false;
            $scope.requestsLength = result.rows.length;
            $scope.doneRequests = 0;
            $scope.requests = [];
            $scope.$apply();
            localStorage.removeItem('offlineMode');

            for (var i = 0; i < result.rows.length; i++) {
              request = _.clone(result.rows.item(i));
              request.body = JSON.parse(request.body);
              $scope.requests.push(request);
            }

            surveysService.surveyList().then(
              function success() {
                if ($rootScope.offlineMode) {
                  $scope.failedSync = true;
                  $scope.syncError = 'No internet connection';
                } else {
                  if ($scope.requests.length !== 0) {
                    async.mapSeries($scope.requests,
                      function (request, cb) {
                        syncService.sendRequest(request).then(
                          function success(config) {
                            if ($rootScope.offlineMode) {
                              if (request.type !== 'editSurvey') {
                                requestSyncComplete(request);
                              }

                              cb('failed');
                              return;
                            }

                            requestSyncComplete(request);

                            $scope.doneRequests = $scope.doneRequests + 1;
                            cb(null);
                          },
                          function failed(err) {
                            if (err.status === 409) {
                              $scope.requestsInConflict.push({
                                title: request.body.title,
                                id: request._id
                              });
                              $scope.doneRequests = $scope.doneRequests + 1;
                            }

                            requestSyncComplete(request);
                            cb(null);
                          });
                      },
                      function (err) {
                        if (err) {
                          $scope.failedSync = true;
                          $scope.syncError = 'Internet connection lost';
                        } else {
                          $scope.successSync = true;
                          localStorage.clear();
                          surveysService.surveyList();
                        }
                      });
                  } else {
                    $scope.successSync = true;
                  }
                }
              });
          }, null);
        });
      };

      $scope.Sync();
    });
})();