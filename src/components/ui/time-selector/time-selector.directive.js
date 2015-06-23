angular.module('mdg.ui.timeSelector',[])
  .directive('timeSelector',
  function () {
    'use strict';
    return {
      restrict: 'EA',
      templateUrl: 'components/ui/time-selector/time-selector.html',
      scope: {
        hours: '=',
        minutes: '='
      },
      replace: true,
      link: function (scope, elem, attr) {
        if (!scope.hours) {
          scope.hours = 0;
        }

        if (!scope.minutes) {
          scope.minutes = 0;
        }

        scope.increaseHours = function () {
          scope.hours = scope.hours < 23 ? ++scope.hours : 0;
        };

        scope.decreaseHours = function () {
          scope.hours = scope.hours <= 0 ? 23 : --scope.hours;
        };

        scope.increaseMinutes = function () {
          scope.minutes = scope.minutes >= 59 ? 0 : ++scope.minutes;
        };

        scope.decreaseMinutes = function () {
          scope.minutes = scope.minutes <= 0 ? 59 : --scope.minutes;
        };

        scope.displayHours = function () {
          return scope.hours <= 9 ? "0" + scope.hours : scope.hours;
        };

        scope.displayMinutes = function () {
          return scope.minutes <= 9 ? "0" + scope.minutes : scope.minutes;
        };
      }
    };
  }
);
