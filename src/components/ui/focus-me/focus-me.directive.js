angular.module('mdg.ui.focusMe', [])
  .directive('focusMe',
  function () {
    'use strict';
    return {
      scope: { trigger: '=focusMe' },
      link: function (scope, element) {
        scope.$watch('trigger', function (value) {
          if (value === true) {
            element[0].children[0].focus();
            scope.trigger = false;
          }
        });
      }
    };
  }
);