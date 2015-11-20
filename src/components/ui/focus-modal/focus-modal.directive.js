angular.module('mdg.ui.focusModal', [])
  .directive('focusModal',
  function () {
    'use strict';
    return {
      link: function (scope, element) {
        var elements = element[0].querySelectorAll('[tabindex]');
        elements[0].focus();

        elements[elements.length - 1].addEventListener('blur', function () {

          elements[0].focus();
        });

        elements[0].addEventListener('focusout', function (e) {
          if (!_.contains($(elements), e.relatedTarget)) {
            elements[0].focus();
          }

        });

      }
    };
  }
);
