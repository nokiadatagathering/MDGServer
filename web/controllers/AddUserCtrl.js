define(function () {
  'use strict';
  return function ($scope, $http, $state, $stateParams, $base64,
                   usersManager, errorsManager, validateManager) {
    $scope.user = {};
    $scope.user.permission = 'admin';
    $scope.errors = {};

    $scope.addUser = function () {
      if ($scope.addUserForm.$error.required.length > 0) {
          _.each($scope.addUserForm.$error.required, function (field) {
            $scope.addUserForm[field].$error.required = true;
          });

          $('input.ng-pristine').addClass('ng-dirty').removeClass('ng-pristine');
      } else if ($('.error-message:not(.ng-hide)').length === 0) {
        $scope.update();

        usersManager.createUser($scope.newUser).then(
          function success (config) {
            $state.go('page.users.group', {}, { reload: true });
          },

          function failed (err) {
            if (err.status === 400 && _.find(err.data, function (data) {
              return data.path === 'email';
            })) {
              $scope.errorEmailPattern = true;
            }

            console.log("error:", err);
          });
      }
    };

    $scope.update = function () {
      $scope.newUser = angular.copy($scope.user);

      if ($scope.newUser.password) {
        $scope.newUser.password = $base64.encode($scope.newUser.password);
      }
    };

    $scope.checkExistingEmail = function () {
      $scope.errorEmailPattern = false;

      validateManager.validate({ field: 'email', value: $scope.user.email }).then(
        function success () {
          $scope.errorExistingEmail = false;
        },

        function failed () {
          $scope.errorExistingEmail = true;
        }
      );
    };

    $scope.checkExistingUsername = function () {
      validateManager.validate({ field: 'username', value: $scope.user.username }).then(
        function success () {
          $scope.errorExistingUsername = false;
        },

        function failed () {
          $scope.errorExistingUsername = true;
        }
      );
    };

    $scope.$watch('addUserForm.username.$error.pattern', function () {
      $scope.errorUsernamePattern = $scope.addUserForm.username.$error.pattern;
    });

    $scope.addFieldsErrors = function () {
      var fields = {
        firstName: [{ minlength: 2 }, { maxlength: 60 }, 'required'],
        lastName: [{ minlength: 2 }, { maxlength: 60 }, 'required'],
        username: [{ minlength: 5 }, { maxlength: 13 }, 'required', 'errorUsernamePattern', 'errorExistingUsername'],
        phone: ['errorPhoneMaxLength', 'errorPhoneMinLength', 'required'],
        email: [{ minlength: 3 }, { maxlength: 60 }, 'required', 'email','errorExistingEmail', 'errorEmailPattern'],
        password: [{ minlength: 8 }, { maxlength: 20 }, 'required']
      };

      _.map(_.pairs(fields), function (field) {
        $scope.errors[field[0]] = errorsManager.getFieldErrorsHtml(field[0], field[1], 'addUserForm');
      });
    };

    $scope.addFieldsErrors();
  };
});
