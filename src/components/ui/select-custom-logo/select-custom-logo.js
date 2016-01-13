angular.module('mdg.ui.selectCustomLogo', [])
  .directive('selectCustomLogo',
  function () {
    'use strict';
    return function (scope, elem, attrs) {
      elem.bind('change', function (event) {
        scope.$apply(function () {
          scope.$parent[attrs.selectCustomLogo] = event.originalEvent.target.files[0];
        });
      });
    };
  }
);
