(function () {
  'use strict';
  angular.module('mdg.app.offline', [])
    .service('offlineService', function ($q, $http, $rootScope) {
      var db;
      try {
        db = openDatabase('mdg', '1.0', 'MDG', 2 * 1024 * 1024);
        db.transaction(function (tx) {
          tx.executeSql('CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT, type TEXT, body TEXT)');
        });
      } catch (e) {
        $rootScope.offlineNotSupport = true;
      }

      function saveRequest(type, body, id) {
        var deferred = $q.defer();

        if ($rootScope.offlineNotSupport) {
          return $q.reject({error: "Your browser does not support webSQL. Please use Google Chrome browser to work in the offline mode."});
        }

        var ids = localStorage.getItem('survey_ids') ? localStorage.getItem('survey_ids').split(',') : [],

          updateLocalStorage = function (type, body, id) {
            if (type == "editSurvey") {
              localStorage.setItem(body.id, JSON.stringify(body));
            }

            if (type == "createSurvey") {
              body.id = id;
              body.resultsCount = 0;
              body.published = false;
              body.dateCreated = new Date().toISOString();
              body._creator = $rootScope.loggedInUser;
              body.__v = 0;

              ids.push(id);

              localStorage.setItem(id, JSON.stringify(body));
              localStorage.setItem('survey_ids', ids);
            }

            if (type == "deleteSurvey") {
              var index = ids.indexOf(body.id);

              ids.splice(index, 1);

              localStorage.removeItem(body.id);
              localStorage.setItem('survey_ids', ids);
            }

            deferred.resolve({data: {id: id}});
          };

        db.transaction(function (tx) {
          tx.executeSql("UPDATE requests SET body = ?, type = ? WHERE _id LIKE ? AND type <> 'createSurvey'", [JSON.stringify(body), type, id],
            function (tx, results) {

              if (results.rowsAffected === 0) {
                tx.executeSql('INSERT INTO requests (_id, body, type) VALUES (?, ?, ?)', [id, JSON.stringify(body), type],
                  function (tx, results) {
                    updateLocalStorage(type, body, id ? id : results.insertId);
                  },
                  function (transaction, error) {
                    console.log('transaction error1: ', error.message);
                  });
              } else {
                updateLocalStorage(type, body, id);
              }
            },
            function (transaction, error) {
              console.log('transaction error2: ', error.message);
            });
        });

        return deferred.promise;
      }

      function getSurveys() {
        var deferred = $q.defer();
        var surveys = [];
        var ids = localStorage.getItem('survey_ids') ? localStorage.getItem('survey_ids').split(',') : [];

        _.each(ids, function (id) {
          surveys.push(JSON.parse(localStorage.getItem(id)));
        });

        deferred.resolve({data: surveys});
        return deferred.promise;
      }

      function getSurveyInfo(id) {
        var deferred = $q.defer();

        deferred.resolve({data: JSON.parse(localStorage.getItem(id))});

        return deferred.promise;
      }

      function saveSurveys(surveys) {
        var ids = [];

        _.each(surveys, function (survey) {
          localStorage.setItem(survey.id, JSON.stringify(survey));
          ids.push(survey.id);
        });

        localStorage.setItem('survey_ids', ids);
      }

      return {
        saveRequest: saveRequest,
        saveSurveys: saveSurveys,
        getSurveys: getSurveys,
        getSurveyInfo: getSurveyInfo
      };
    });
})();
