define(function () {
  'use strict';
  return function ($compile) {
    return {
      restrict: 'A',
      replace: true,
      link: function (scope, ele, attrs) {
        scope.$watch(attrs.errorsblock, function (html) {
          ele.html(html);
          $compile(ele.contents())(scope);
        });
      }
    };
  };
});
