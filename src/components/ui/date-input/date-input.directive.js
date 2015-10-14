angular.module('mdg.ui.dateInput', [])
  .directive('dateInput',
  function ($filter) {
    'use strict';
    return {
      restrict: 'AC',
      replace: true,
      scope: {
        dateInput: '=',
        maxRange: '=',
        minRange: '='
      },
      link: function (scope, element) {
        var
          parseDate = function (date) {
            if (date) {
              if (date.indexOf('/') !== -1) {
                date = date.split('/');
                date = date[2] + '-' + date[1] + '-' + date[0];
              }

              return  new Date(date);
            } else {
              return null;
            }
          },
          minDate = parseDate(scope.minRange),
          maxDate = parseDate(scope.maxRange);

        scope.dateInput = scope.dateInput ? $filter('date')(scope.dateInput, 'dd/MM/yyyy') : null;

        element.datepicker({
          dateFormat: 'dd/mm/yy',
          minDate: minDate,
          maxDate: maxDate
        });

        element.datepicker( "setDate",  scope.dateInput);
      },
      template: '<input type="text" class="select-field" placeholder="">'
    };
  }
);
