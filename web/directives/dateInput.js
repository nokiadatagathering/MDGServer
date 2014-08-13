define(function () {
  'use strict';
  return function ($filter) {
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
          minDate = scope.minRange ? new Date(scope.minRange) : null,
          maxDate = scope.maxRange ? new Date(scope.maxRange) : null;

        scope.dateInput = scope.dateInput ? $filter('date')(scope.dateInput, 'dd/MM/yyyy') : null;

        element.datepicker({
          dateFormat: 'dd/mm/yy',
          minDate: minDate,
          maxDate: maxDate
        });
      },
      template: '<input type="text" readonly="readonly" class="select-field" value="{{ dateInput }}">'
    };
  };
});
