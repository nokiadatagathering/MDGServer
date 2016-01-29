angular.module('mdg.app.sync')
  .controller('SyncController',
  function ($scope, $http, $q, $location, $window, $state, $rootScope, $log, syncService, surveysService) {
    $scope.requestsInConflict = [];

    var request;
    var db = openDatabase('mdg', '1.0', 'MDG', 2 * 1024 * 1024);
    var requestSyncComplete = function (request) {
      db.transaction(function (tx) {
        tx.executeSql("DELETE FROM requests WHERE id == ?", [request.id], function (tx, result) {
        });
      });
    };

    var asyncRequest = function (requests) {
      var deferred = $q.defer();

      _(requests).each(function (request) {
        syncService.sendRequest(request).then(
          function success(config) {
            if ($rootScope.offlineMode) {
              if (request.type !== 'editSurvey') {
                requestSyncComplete(request);
              }
              return;
            }
            requestSyncComplete(request);

            $scope.doneRequests = $scope.doneRequests + 1;
            deferred.resolve();
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
            deferred.reject(err);
          });
      });
      return deferred.promise;
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

          _(result.rows).each(function (row) {
            request = _.clone(row);
            request.body = JSON.parse(request.body);
            $scope.requests.push(request);
          });

          surveysService.surveyList().then(
            function success() {
              if ($rootScope.offlineMode) {
                $scope.failedSync = true;
                $scope.syncError = 'No internet connection';
              } else if ($scope.requests.length !== 0) {

                asyncRequest($scope.requests).then(
                  function () {
                    $scope.successSync = true;
                    localStorage.clear();
                    surveysService.surveyList();
                    $scope.close();
                  },
                  function (err) {
                    $scope.failedSync = true;
                    $scope.syncError = 'Internet connection lost';
                  }
                );

              } else {
                $scope.successSync = true;
              }
            });
        }, null);
      });
    };
    $scope.close = function () {
      $state.go('page.surveys.list', {}, {reload: true});
    };

    $scope.Sync();


  });

