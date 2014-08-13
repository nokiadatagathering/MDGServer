define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, $rootScope, $stateParams,
                   errorsManager,
                   resultsManager,
                   surveysManager,
                   subscriptionManager) {

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
      { text: 'Export to:', value: '' },
      { text: 'KML', value: 'kml' },
      { text: 'CSV', value: 'csv' },
      { text: 'Excel', value: 'xls' }
    ];
    $scope.dropdownSelect = {};
    function getCurrentState () {
      var state = 'page.';

      if ($scope.path.indexOf('/map') !== -1) {
        state = state + 'map';
      } else {
        state = state + 'results';
      }

      if ($stateParams.resultId !== undefined) {
        state = state + '.details';
      }

      return state;
    }

    $('#from').datepicker({
      dateFormat: 'dd/mm/yy',
      defaultDate: '+0d',
      onClose: function (selectedDate) {
        $('#to').datepicker('option', 'minDate', selectedDate);
      }
    });

    $('#to').datepicker({
      dateFormat: 'dd/mm/yy',
      defaultDate: '+0d',
      onClose: function (selectedDate) {
        $('#from').datepicker('option', 'maxDate', selectedDate);
      }
    });

    $scope.getResultList = function () {
      resultsManager.resultList($stateParams.surveyId).then(
        function success (config) {
          $scope.results = config.data;

          if ($scope.results.length === $rootScope.selectedResults.length) {
            $scope.allChecked = true;
          }
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getSurveyInfo = function () {
      surveysManager.surveyInfo($stateParams.surveyId).then(
        function success (config) {
          $scope.survey = config.data;
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.modalSentTo = function () {
      $rootScope.goState(getCurrentState() + '.sentto');
    };

    $scope.viewMap = function () {
      if ($rootScope.selectedResults.length === 0) {
        $rootScope.$broadcast('choose_results', 'view map');
        return;
      }

      $rootScope.goState('page.map', $stateParams.surveyId);
    };

    $scope.modalExportSchedule = function () {
      $rootScope.goState(getCurrentState() + '.exportschedule');
    };

    $scope.modalResultsChart = function () {
      if ($rootScope.selectedResults.length === 0) {
        $rootScope.$broadcast('choose_results', 'view charts');
        return;
      }

      $rootScope.goState(getCurrentState() + '.resultschart');
    };

    $scope.formSelectedResults = function (resultId) {
      if (resultId) {
        var index = $rootScope.selectedResults.indexOf(resultId);

        if (index !== -1) {
          $rootScope.selectedResults.splice (index, 1);
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

      $rootScope.goState('page.results');
      $rootScope.$broadcast('deleted_result', $scope.survey._id, $rootScope.selectedResults, $scope.survey.title);
    };

    $scope.getSubscriptions = function () {
      subscriptionManager.subscriptionList($stateParams.surveyId).then(
        function success (config) {
          $scope.subscriptions = config.data;
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.deleteSubscription = function (subscriptionId, index) {
      subscriptionManager.deleteSubscription($stateParams.surveyId, subscriptionId).then(
        function success (config) {
          $scope.subscriptions.splice (index, 1);
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.createSubscription = function () {
      if ($scope.exportScheduleForm.$error.required.length > 0) {
        $scope.exportScheduleForm.from.$dirty = true;
        $scope.exportScheduleForm.to.$dirty = true;
        $scope.exportScheduleForm.email.$dirty = true;

        $('input.ng-pristine').addClass('ng-dirty').removeClass('ng-pristine');
      } else if ($('.error-message:not(.ng-hide)').length === 0) {
        delete $scope.schedule._id;

        subscriptionManager.createSubscription($stateParams.surveyId, $scope.schedule).then(
          function success (config) {
            $scope.schedule._id = config.data.id;
            $scope.subscriptions.push(_.clone($scope.schedule));
            $scope.schedule = {};

            $scope.exportScheduleForm.from.$setPristine();
            $scope.exportScheduleForm.to.$setPristine();
            $scope.exportScheduleForm.email.$setPristine();

            $('#from').datepicker('option', 'maxDate', null);
            $('#to').datepicker('option', 'minDate', null);
          },

          function failed (err) {
            if (err.status === 400) {
              $scope.errorEmailPattern = true;
            }
            console.log("error:", err);
          });
      }
    };

    $scope.exportResults = function (type) {
      if ($rootScope.selectedResults.length === 0) {
        $rootScope.$broadcast('choose_results', 'export');
      } else if ($scope.dropdownSelect.value) {
        var fakeForm = $('<form>')
          .attr('method', 'POST')
          .attr('action', '/export/' + $stateParams.surveyId + '/?type=' + type)
          .append($rootScope.selectedResults.map(function (id, index) {
              return $('<input>')
                .attr('name', 'results[' + index + ']')
                .attr('value', id)
              ;
            }
          ));
        fakeForm.submit();
      }
    };

    $scope.addFieldsErrors = function () {
      var fields = {
        email: ['required', 'email', 'errorEmailPattern'],
        from: ['required'],
        to: ['required']
      };

      _.map(_.pairs(fields), function (field) {
        $scope.errors[field[0]] = errorsManager.getFieldErrorsHtml(field[0], field[1], 'exportScheduleForm');
      });
    };

    $scope.$on("$destroy", function () {
      $('#ui-datepicker-div').css('display', 'none');
    });

    $scope.addFieldsErrors();

    $scope.getResultList();
    $scope.getSurveyInfo();
    $scope.getSubscriptions();
  };
});
