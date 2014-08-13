define(function () {
  'use strict';
  return function () {
    return function (scope, elem, attrs) {
      elem.bind('change', function (event) {
        scope.$apply(function () {
          scope[attrs.fileSelect] = event.originalEvent.target.files[0];
          scope.uploadSurvey();
          elem.val(null);
        });
      });
    };
  };
});
