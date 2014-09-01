define(function () {

  'use strict';
  return function ($q, $http, $rootScope, offlineManager) {
    /** @const */
    var
      SURVEYS_URL = '/surveys/',
      SURVEY_SEND_URL = '/sendSurvey/',
      SURVEY_DUPLICATE_URL = '/duplicate/',
      SURVEY_ARCHIVE_URL = '/archive/',
      XML_URL = '/xml';

    function surveyList (archive) {
      if (archive) {
        return $http.get(SURVEYS_URL + '?archive=true')
          .success(function (result) {
          });
      }

      if ($rootScope.offlineMode) {
        return offlineManager.getSurveys();
      }

      return $http.get(SURVEYS_URL).then(function (result) {
        var deferred = $q.defer();

        if ($rootScope.offlineMode) {
          return offlineManager.getSurveys();
        } else {
          offlineManager.saveSurveys(result.data);
          deferred.resolve(result);
          return deferred.promise;
        }
      });
    }

    function surveyInfo (surveyId) {
      if ($rootScope.offlineMode) {
        return offlineManager.getSurveyInfo(surveyId);
      }

      return $http.get(SURVEYS_URL + surveyId).then(function (result) {
        var deferred = $q.defer();

        if ($rootScope.offlineMode) {
          return offlineManager.getSurveyInfo(surveyId);
        } else {
          deferred.resolve(result);
          return deferred.promise;
        }
      });
    }

    function sendSurvey (surveyId, users) {
      var survey_send_url = SURVEY_SEND_URL + surveyId;
      return $http.post(survey_send_url, users)
        .success(function (result) {
        });
    }

    function deleteSurvey (data) {
      var
        surveyId = data.id,
        delete_survey_url = SURVEYS_URL + surveyId;

      if ($rootScope.offlineMode) {
        return offlineManager.saveRequest('deleteSurvey', { id: surveyId }, surveyId);
      }

      return $http.delete(delete_survey_url).then(function (result) {
        var deferred = $q.defer();

        if ($rootScope.offlineMode) {
          return offlineManager.saveRequest('deleteSurvey', { id: surveyId }, surveyId);
        } else {
          deferred.resolve(result);
          return deferred.promise;
        }
      });
    }

    function duplicateSurvey (surveyId) {
      var duplicate_survey_url = SURVEY_DUPLICATE_URL + surveyId;
      return $http.post(duplicate_survey_url)
        .success(function (result) {
        });
    }

    function editSurvey (data) {
      var
        surveyId = data.id,
        surveyData = data.body,
        edit_survey_url = SURVEYS_URL + surveyId;

      if ($rootScope.offlineMode) {
        return offlineManager.saveRequest('editSurvey', surveyData, surveyId);
      }

      return $http.put(edit_survey_url, surveyData).then(function (result) {
        var deferred = $q.defer();

        if ($rootScope.offlineMode) {
          return offlineManager.saveRequest('editSurvey', surveyData, surveyId);
        } else {
          deferred.resolve(result);
          return deferred.promise;
        }
      });
    }

    function createSurvey (data) {
      var surveyData = data.body;

      if ($rootScope.offlineMode) {
        return offlineManager.saveRequest('createSurvey', surveyData);
      }

      return $http.post(SURVEYS_URL, surveyData).then(function (result) {
        var deferred = $q.defer();

        if ($rootScope.offlineMode) {
          return offlineManager.saveRequest('createSurvey', surveyData);
        } else {
          deferred.resolve(result);
          return deferred.promise;
        }
      });
    }

    function uploadXML (file, cb) {
      var data = new FormData(),
        xhr = new XMLHttpRequest();

      xhr.onerror = function (e) {
        console.log(e);
      };

      data.append('xml', file);
      xhr.open('POST', XML_URL);
      xhr.send(data);
      xhr.onload = function (res) {
        if (res.currentTarget.status === 400) {
          cb('error');
        } else {
          cb();
        }
      };
    }

    function downloadXML (surveyId) {
      var downloa_xml_url = XML_URL + '/' + surveyId;
      document.location = downloa_xml_url;
    }

    function checkFileType (file) {
      if (file.type === 'text/xml') {
        return true;
      } else {
        return false;
      }
    }

    function archiveSurvey (surveyId) {
      var archive_survey_url = SURVEY_ARCHIVE_URL + surveyId;

      return $http.post(archive_survey_url)
        .success(function (result) {
        });
    }

    return {
      surveyList:      surveyList,
      surveyInfo:      surveyInfo,
      sendSurvey:      sendSurvey,
      deleteSurvey:    deleteSurvey,
      duplicateSurvey: duplicateSurvey,
      editSurvey:      editSurvey,
      createSurvey:    createSurvey,
      uploadXML:       uploadXML,
      downloadXML:     downloadXML,
      checkFileType:   checkFileType,
      archiveSurvey:   archiveSurvey
    };
  };
});
