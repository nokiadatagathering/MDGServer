define(function () {
  'use strict';
  return function () {
    return {
      scope: {
        regexp: '=regexp',
        value: '=valueToCheck'
      },
      controller: function ($scope) {
        $scope.$watch('value', function (newValue, oldValue) {
          if (!new RegExp($scope.regexp).test(newValue)) {
            $scope.value = oldValue ? oldValue : '';
          }
        });
      }
    };
  };
});
