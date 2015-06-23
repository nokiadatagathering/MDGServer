(function () {
  'use strict';
  angular.module('mdg.app.results')
    .service('resultsService', function ($q, $http) {
      /** @const */
      var
        RESULT_URL = '/results/',
        SURVEY_URL = '/surveys/';

      function resultList(surveyId) {
        var result_list_url = SURVEY_URL + surveyId + RESULT_URL;

        return $http.get(result_list_url)
          .success(function (result) {
          });
      }

      function resultDetails(surveyId, resultId) {
        var result_details_url = SURVEY_URL + surveyId + RESULT_URL + resultId;

        return $http.get(result_details_url)
          .success(function (result) {
          });
      }

      function deleteResult(surveyId, resultId) {
        var result_delete_url = SURVEY_URL + surveyId + RESULT_URL + resultId;

        return $http.delete(result_delete_url)
          .success(function (result) {
          });
      }

      return {
        resultList: resultList,
        deleteResult: deleteResult,
        resultDetails: resultDetails
      };
    });
})();