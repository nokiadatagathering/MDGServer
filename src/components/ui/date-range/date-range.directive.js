angular.module('mdg.ui.dateRange', [])
  .directive('dateRange',
  function () {
    'use strict';
    return {
      restrict: 'AC',
      require: '^dateInput',
      replace: false,
      scope: {
        maxRange: '=',
        minRange: '=',
        maxChecked: '=',
        minChecked: '=',
        checkboxes: '=withCheckboxes'
      },
      controller: [
        '$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
          var minElem = $element.find('[date-input="minRange"]'),
            maxElem = $element.find('[date-input="maxRange"]'),
            defaultDate = $element.parent().find('.b-question-builder__input-box--input'),
            minDate,
            maxDate,

            convertDate = function (date) {
              var yyyy = date.getFullYear().toString(),
                mm = (date.getMonth() + 1).toString(),
                dd  = date.getDate().toString();
              return (dd[1] ? dd : "0" + dd[0]) + '/' + (mm[1] ? mm : "0" + mm[0]) + '/' + yyyy;
            },
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
            };

          maxDate = parseDate($scope.maxRange);
          minDate = parseDate($scope.minRange);

          if ($scope.minChecked === undefined) {
            $scope.minChecked = !!minDate;
          }

          if ($scope.maxChecked === undefined) {
            $scope.maxChecked = !!maxDate;
          }

          $(minElem).datepicker({
            dateFormat: 'dd/mm/yy',
            changeYear: true,
            changeMonth: true,
            maxDate: maxDate,
            disabled: !$scope.minChecked,
            onClose: function (selectedDate) {
              $(maxElem).datepicker('option', 'minDate', selectedDate);
              changeDate('min',  $(minElem).datepicker('getDate'));
            }
          });
          $(maxElem).datepicker({
            dateFormat: 'dd/mm/yy',
            changeYear: true,
            changeMonth: true,
            minDate: minDate,
            disabled: !$scope.maxChecked,
            onClose: function (selectedDate) {
              $(minElem).datepicker('option', 'maxDate', selectedDate);
              changeDate('max', $(maxElem).datepicker('getDate'));
            }
          });

          $scope.disableInput = function (value) {
            var
              checkedOption = value + 'Checked',
              targetDate = value + 'Date',
              targetEl = value === 'min' ? minElem : maxElem,
              otherEl = value === 'min' ? maxElem : minElem;

            $(targetEl).datepicker('option', 'disabled', $scope[checkedOption]);
            $scope[checkedOption] = !$scope[checkedOption];
            $scope.$parent.$parent.question[checkedOption] = $scope[checkedOption];

            if ($scope[checkedOption]) {
              if ($(targetEl).datepicker('getDate')) {
                $(defaultDate).datepicker('option', targetDate, $(targetEl).datepicker('getDate'));
                $(otherEl).datepicker('option', targetDate, $(targetEl).datepicker('getDate'));

                if ($(defaultDate).datepicker('getDate')) {
                  $scope.$parent.$parent.question.defaultValue = convertDate($(defaultDate).datepicker('getDate'));
                }

                return;
              }

              $(targetEl).datepicker("show");
            } else {
              $(defaultDate).datepicker('option', targetDate, null);
              $(otherEl).datepicker('option', targetDate, null);
            }
          };

          var changeDate = function (type, date) {
            if ($scope.$parent.$parent.question.type == 'date' && date && (defaultDate.length > 0)) {
              $(defaultDate).datepicker('option', type + 'Date', date);

              $scope.$parent.$parent.question[type + 'Value'] = convertDate(date);

              if ($(defaultDate).datepicker('getDate')) {
                $scope.$parent.$parent.question.defaultValue = convertDate($(defaultDate).datepicker('getDate'));
              }
            }
          };
        }
      ],
      templateUrl: 'components/ui/date-range/date-range.html'
    };
  }
);
