define(function () {
    'use strict';
    return function ($scope, $http, $location, $window) {

      $scope.editCategoryTitle = function () {
        $('.category-header input[type=text]').toggleClass('hide');
        $('.category-header h2').toggleClass('hide');
        $('.category-header .options').toggleClass('hide');
      };

      $('.edit-category-header').focusout(function () {
        $('.category-header input[type=text]').toggleClass('hide');
        $('.category-header h2').toggleClass('hide');
        $('.category-header .options').toggleClass('hide');
      });
     };
});
