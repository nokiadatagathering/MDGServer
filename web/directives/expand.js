define(function () {
  'use strict';
  return function () {
    return {
      restrict: 'C',
      scope: {
        isVisible: "=visible",
        click: "=click"
      },
      controller: function ($scope, $element) {
        var clickFunction = function () {};
        if ($scope.click !== undefined) {
          clickFunction = $scope.click;
        }
        $element.find('input').on('click', function (event) {
          event.stopPropagation();
        });
        $scope.click = function () {
          $element.toggleClass('close');
          $scope.isVisible = !$scope.isVisible;
          clickFunction.apply(this, arguments);
        };
      }
    };
  };
});
