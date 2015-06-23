(function () {
  'use strict';
  angular.module('mdg.app.results').controller('resultsExportController',
    function ($scope, $http, $location, $window, $stateParams,
              subscriptionService, errorsService) {

      $scope.subscriptions = {};

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

      $scope.getSubscriptions = function () {
        subscriptionService.subscriptionList($stateParams.surveyId).then(
          function success(config) {
            $scope.subscriptions = config.data;
          },

          function failed(err) {
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

          subscriptionService.createSubscription($stateParams.surveyId, $scope.schedule).then(
            function success(config) {
              $scope.schedule._id = config.data.id;
              $scope.subscriptions.push(_.clone($scope.schedule));
              $scope.schedule = {};

              $scope.exportScheduleForm.from.$setPristine();
              $scope.exportScheduleForm.to.$setPristine();
              $scope.exportScheduleForm.email.$setPristine();

              $('#from').datepicker('option', 'maxDate', null);
              $('#to').datepicker('option', 'minDate', null);
            },

            function failed(err) {
              if (err.status === 400) {
                $scope.errorEmailPattern = true;
              }
              console.log("error:", err);
            });
        }
      };

      $scope.deleteSubscription = function (subscriptionId, index) {
        subscriptionService.deleteSubscription($stateParams.surveyId, subscriptionId).then(
          function success(config) {
            $scope.subscriptions.splice(index, 1);
          },

          function failed(err) {
            console.log("error:", err);
          });
      };


      $scope.addFieldsErrors = function () {
        var fields = {
          email: ['required', 'email', 'errorEmailPattern'],
          from: ['required'],
          to: ['required']
        };

        _.map(_.pairs(fields), function (field) {
          $scope.errors[field[0]] = errorsService.getFieldErrorsHtml(field[0], field[1], 'exportScheduleForm');
        });
      };

      $scope.$on("$destroy", function () {
        $('#ui-datepicker-div').css('display', 'none');
      });

      $scope.addFieldsErrors();
      $scope.getSubscriptions();

    });
})();
