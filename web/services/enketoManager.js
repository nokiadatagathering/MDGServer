define(function () {
  'use strict';
  return function ($q, $http) {
    /** @const */
    var URL = '/enketoSurveyUrl';

    function getResponseFrameUrl (surveyId) {
      return $http.get(URL + '/' + surveyId);
    }

    return {
      getResponseFrameUrl: getResponseFrameUrl
    };
  };
});