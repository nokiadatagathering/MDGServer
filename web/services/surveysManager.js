define(function () {

  'use strict';
  return function ($q, $http, $rootScope) {
    /** @const */
    var
      SURVEYS_URL = '/surveys/',
      SURVEY_SEND_URL = '/sendSurvey/',
      SURVEY_DUPLICATE_URL = '/duplicate/',
      SURVEY_ARCHIVE_URL = '/archive/',
      XML_URL = '/xml';

    function surveyList (archive) {
      return $http.get(SURVEYS_URL + '?archive=' + archive)
        .success(function (result) {
        });
    }

    function surveyInfo (surveyId) {
      return $http.get(SURVEYS_URL + surveyId)
        .success(function (result) {
        });
    }

    function sendSurvey (surveyId, users) {
      var survey_send_url = SURVEY_SEND_URL + surveyId;
      return $http.post(survey_send_url, users)
        .success(function (result) {
        });
    }

    function deleteSurvey (surveyId) {
      var delete_survey_url = SURVEYS_URL + surveyId;
      return $http.delete(delete_survey_url)
        .success(function (result) {
        });
    }

    function duplicateSurvey (surveyId) {
      var duplicate_survey_url = SURVEY_DUPLICATE_URL + surveyId;
      return $http.post(duplicate_survey_url)
        .success(function (result) {
        });
    }
    function editSurvey (surveyId, surveyData) {
      var edit_survey_url = SURVEYS_URL + surveyId;
      return $http.put(edit_survey_url, surveyData)
        .success(function (result) {
        });
    }
    function createSurvey (surveyData) {
      return $http.post(SURVEYS_URL, surveyData)
        .success(function (result) {
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
