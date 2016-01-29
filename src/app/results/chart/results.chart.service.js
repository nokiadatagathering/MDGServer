(function () {
  'use strict';
  angular.module('mdg.app.results')
    .service('resultsChartService', function ($q, $http) {
    /** @const */
    var
      CHART_URL = '/chartUrl',
      CHART_DATA = '/chartData';

    function getChartUrl (data) {
      return $http.post(CHART_URL, data)
        .success(function (result) {
        });
    }

    function getChartData (data) {
      return $http.post(CHART_DATA, data)
        .success(function (result) {
        });
    }

    return {
      getChartUrl: getChartUrl,
      getChartData: getChartData
    };
  });
})();
