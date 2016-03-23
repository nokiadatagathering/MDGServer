(function () {
  'use strict';
  angular.module('mdg.app.results').controller('resultsController',
    function ($scope, $http, $location, $window, $rootScope, $stateParams, $state,
              errorsService,
              resultsService,
              surveysService,
              subscriptionService) {

      $scope.today = new Date();
      $scope.allChecked = false;
      $scope.path = $location.$$path;
      $scope.results = {};
      $scope.schedule = {};
      $scope.survey = {};
      $scope.subscriptions = {};
      $scope.exportForm = {};
      $scope.errors = {};

      $scope.selected = {
        results : ($scope.selected && $scope.selected.results) ? $scope.selected.results : []
      };
      $scope.dropdownList = [
        {text: 'Export to:', value: ''},
        {text: 'KML', value: 'kml'},
        {text: 'CSV', value: 'csv'},
        {text: 'Excel', value: 'xls'}
      ];
      $scope.dropdownSelect = {};

      $scope.getResultList = function () {
        resultsService.resultList($stateParams.surveyId).then(
          function success(config) {
            $scope.results = config.data;
          },

          function failed(err) {
            console.log("error:", err);
          });
      };

      $scope.getSurveyInfo = function () {
        surveysService.surveyInfo($stateParams.surveyId).then(
          function success(config) {
            $scope.survey = config.data;
          },

          function failed(err) {
            console.log("error:", err);
          });
      };

      $scope.modalSentTo = function () {
        $state.go($state.current.name + '.sentto');
      };

      $scope.viewMap = function () {
        if ($scope.selected.results.length === 0) {
          $rootScope.$broadcast('choose_results', 'view_map');
          return;
        }

        $state.go('page.results.map', {surveyId: $stateParams.surveyId});
      };

      $scope.modalExportSchedule = function () {
        $state.go($state.$current.name + '.exportschedule');
      };

      $scope.modalResultsChart = function () {
        if ($scope.selected.results.length === 0) {
          $rootScope.$broadcast('choose_results', 'view_charts');
          return;
        }
        $state.go($state.$current.name + '.resultschart');

      };

      $scope.selectAllResults = function () {
        if ($scope.selected.results.length > 0) {
          $scope.selected.results = [];
        } else {
          $scope.selected.results = _($scope.results).pluck('_id');
        }
      };

      $scope.formSelectedResults = function (resultId) {
        if (_($scope.selected.results).contains(resultId)) {
          $scope.selected.results = _($scope.selected.results).without(resultId);

        } else {
          $scope.selected.results.push(resultId);
        }
      };

      $scope.deleteResults = function () {
        if ($scope.selected.results.length === 0) {
          $rootScope.$broadcast('choose_results', 'delete');
          return;
        }

        $rootScope.deletedItems.results = _.flatten([$rootScope.deletedItems.results, $scope.selected.results]);
        $rootScope.$broadcast('deleted_result', $scope.survey._id, $scope.selected.results, $scope.survey.title);
        $state.go('page.results.list');
      };

      $scope.getSubscriptions = function () {
        subscriptionService.subscriptionList($stateParams.surveyId).then(
          function success(config) {
            $scope.subscriptions = config.data;
          },

          function failed(err) {
            console.log("error:", err);
          });
      };

      $scope.exportResults = function (type) {
        if ($scope.selected.results.length === 0) {
          $rootScope.$broadcast('choose_results', 'export');
        } else if (type) {

          var fakeForm = $('<form>')
            .attr('method', 'POST')
            .attr('action', '/export/' + $stateParams.surveyId + '/?type=' + type)
            .append($scope.selected.results.map(function (id, index) {
                return $('<input type="hidden">')
                  .attr('name', 'results[' + index + ']')
                  .attr('value', id)
                  ;
              }
            ));
          fakeForm.appendTo("body").submit();
        }
      };

      $scope.getResultList();
      $scope.getSurveyInfo();
      $scope.getSubscriptions();
    });
})();
