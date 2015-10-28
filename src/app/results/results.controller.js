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
      $rootScope.selectedResults = $rootScope.selectedResults ? $rootScope.selectedResults : [];
      $scope.survey = {};
      $scope.subscriptions = {};
      $scope.exportForm = {};
      $scope.errors = {};

      $scope.dropdownList = [
        {text: 'Export to:', value: ''},
        {text: 'KML', value: 'kml'},
        {text: 'CSV', value: 'csv'},
        {text: 'Excel', value: 'xls'}
      ];
      $scope.dropdownSelect = {};

      //$('#from').datepicker({
      //  dateFormat: 'dd/mm/yy',
      //  defaultDate: '+0d',
      //  onClose: function (selectedDate) {
      //    $('#to').datepicker('option', 'minDate', selectedDate);
      //  }
      //});
      //
      //$('#to').datepicker({
      //  dateFormat: 'dd/mm/yy',
      //  defaultDate: '+0d',
      //  onClose: function (selectedDate) {
      //    $('#from').datepicker('option', 'maxDate', selectedDate);
      //  }
      //});

      $scope.getResultList = function () {
        resultsService.resultList($stateParams.surveyId).then(
          function success(config) {
            $scope.results = config.data;

            if ($scope.results.length === $rootScope.selectedResults.length) {
              $scope.allChecked = true;
            }
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
        if ($rootScope.selectedResults.length === 0) {
          $rootScope.$broadcast('choose_results', 'view_map');
          return;
        }

        $state.go('page.results.map', {surveyId: $stateParams.surveyId});
      };

      $scope.modalExportSchedule = function () {
        $state.go($state.$current.name + '.exportschedule');
      };

      $scope.modalResultsChart = function () {
        if ($rootScope.selectedResults.length === 0) {
          $rootScope.$broadcast('choose_results', 'view_charts');
          return;
        }
        $state.go($state.$current.name + '.resultschart');

      };

      $scope.formSelectedResults = function (resultId) {
        if (resultId) {
          var index = $rootScope.selectedResults.indexOf(resultId);

          if (index !== -1) {
            $rootScope.selectedResults.splice(index, 1);
          } else {
            $rootScope.selectedResults.push(resultId);
          }
        } else {
          if (!$scope.allChecked && $scope.results.length !== $rootScope.selectedResults.length) {
            $rootScope.selectedResults = [];

            _.each($scope.results, function (result) {
              $rootScope.selectedResults.push(result._id);
            });
          } else {
            $rootScope.selectedResults = [];
          }
        }
      };

      $scope.deleteResults = function () {
        if ($rootScope.selectedResults.length === 0) {
          $rootScope.$broadcast('choose_results', 'delete');
          return;
        }

        $rootScope.deletedItems.results = _.flatten([$rootScope.deletedItems.results, $rootScope.selectedResults]);
        $rootScope.$broadcast('deleted_result', $scope.survey._id, $rootScope.selectedResults, $scope.survey.title);
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
        if ($rootScope.selectedResults.length === 0) {
          $rootScope.$broadcast('choose_results', 'export');
        } else if ($scope.dropdownSelect.value) {

          var fakeForm = $('<form>')
            .attr('method', 'POST')
            .attr('action', '/export/' + $stateParams.surveyId + '/?type=' + type)
            .append($rootScope.selectedResults.map(function (id, index) {
                return $('<input type="hidden">')
                  .attr('name', 'results[' + index + ']')
                  .attr('value', id)
                  ;
              }
            ));
          fakeForm.appendTo("body").submit();
        }
      };

      //$scope.addFieldsErrors = function () {
      //  var fields = {
      //    email: ['required', 'email', 'errorEmailPattern'],
      //    from: ['required'],
      //    to: ['required']
      //  };
      //
      //  _.map(_.pairs(fields), function (field) {
      //    $scope.errors[field[0]] = errorsService.getFieldErrorsHtml(field[0], field[1], 'exportScheduleForm');
      //  });
      //};
      //
      //$scope.$on("$destroy", function () {
      //  $('#ui-datepicker-div').css('display', 'none');
      //});

      //$scope.addFieldsErrors();

      $scope.getResultList();
      $scope.getSurveyInfo();
      $scope.getSubscriptions();
    });
})();
