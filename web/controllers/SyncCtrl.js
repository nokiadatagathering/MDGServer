define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, $state, $rootScope, syncManager, surveysManager) {
    $scope.requestsInConflict = [];

    var
      request,
      db = openDatabase('ndg', '1.0', 'NDG', 2 * 1024 * 1024),
      requestSyncComplete = function (request) {
        db.transaction(function (tx) {
          tx.executeSql("DELETE FROM requests WHERE id == ?", [request.id], function (tx, result) {});
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

          async.mapSeries($scope.requests,
            function (request, cb) {
              syncManager.sendRequest(request).then(
                function success (config) {
                  if ($rootScope.offlineMode) {
                    cb('failed');
                    return;
                  }

                  $scope.doneRequests = $scope.doneRequests + 1;
                  requestSyncComplete(request);

                  cb(null);
                },
                function failed (err) {
                  if (err.status === 409) {
                    $scope.requestsInConflict.push({ title: request.body.title, id: request._id });
                  }

                  requestSyncComplete(request);
                  cb(null);
                });
            },
            function (err) {
              if (err) {
                $scope.failedSync = true;
              } else {
                localStorage.clear();
                surveysManager.surveyList();
              }
            });
        }, null);
      });
    };

    $scope.Sync();
  };
});
