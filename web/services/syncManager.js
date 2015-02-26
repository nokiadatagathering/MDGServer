define(function () {
  'use strict';
  return function ($q, $http, $rootScope, surveysManager) {

    var db;

    try {
      db = openDatabase('ndg', '1.0', 'NDG', 2 * 1024 * 1024);
    } catch (e) {
      $rootScope.offlineNotSupport = true;
    }

    function sendRequest (request) {
      if (request._id && request._id.length < 24) {
        request._id =  localStorage.getItem(request._id);
      }

      return surveysManager[request.type]({ id: request._id, body: request.body }).then(function (result) {
        var deferred = $q.defer();

        if (request.type === 'createSurvey') {
          db.transaction(function (tx) {
            tx.executeSql("UPDATE requests SET _id = ? WHERE _id LIKE ? ", [result.data.id, request.id], function (tx, results) {
              localStorage.setItem(request.id, result.data.id);
              deferred.resolve(result);
            }, null);
          });
        } else {
          deferred.resolve(result);
        }

        return deferred.promise;
      });
    }

    return {
      sendRequest: sendRequest
    };
  };
});
