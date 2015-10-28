angular.module('mdg.ui.fileSelect', [])
  .directive('fileSelect',
  function () {
    'use strict';
    return function (scope, elem, attrs) {
      elem.bind('change', function (event) {
        scope.$apply(function () {
          scope.$parent[attrs.fileSelect] = event.originalEvent.target.files[0];
          scope.$parent.uploadSurvey();
          elem.val(null);
        });
      });
    };
  }
);
