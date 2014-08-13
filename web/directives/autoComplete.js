define(function () {
  'use strict';
  return ['$timeout', 'autocompleteManager', function ($timeout, autocompleteManager) {
    return {
      restrict: 'A',
      scope: {
        autocompleteType: "@autocompleteType"
      },
      link: function (scope, elem, attrs) {
        var autocomplete = function () {
          autocompleteManager.getValues(scope.autocompleteType).then(
            function success (config) {
              elem.autocomplete({
                source: config.data,

                select: function () {
                  $timeout(function () {
                    elem.trigger('input');
                  }, 0);
                }
              });
            },

            function failed (err) {
              console.log("error:", err);
            }
          );
        };
        autocomplete();
      }
    };
  }];
});
