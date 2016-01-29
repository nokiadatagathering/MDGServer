(function () {
  'use strict';

  angular.module('mdg.app.users').controller('UsersEditController',
    function ($scope, $http, $state, $stateParams, $base64,
              usersService, errorsService, validateService) {
      $scope.user = {};
      $scope.userUpdated = {};
      $scope.errors = {};

      $scope.oldEmail = '';
      $scope.oldUsername = '';
      $scope.oldPhone = '';

      $scope.getUserInfo = function (userId) {
        usersService.userInfo(userId).then(
          function success (config) {
            $scope.user = config.data;
            $scope.user.password = '';
            $scope.user.confirmpass = '';
            $scope.oldEmail = $scope.user.email;
            $scope.oldUsername = $scope.user.username;
            $scope.oldPhone = $scope.user.phone;
          },

          function failed (err) {
            console.log("error:", err);
          });
      };

      $scope.getUserInfo($stateParams.userId);

      $scope.updateUser = function (userId) {
        if ($scope.editUserForm.$error.required.length > 0) {
          _.each($scope.editUserForm.$error.required, function (field) {
            $scope.editUserForm[field.$name].$error.required = true;
            $scope.editUserForm[field.$name].$setViewValue($scope.editUserForm[field.$name].$viewValue);
          });

          $scope.editUserForm.$setDirty();
        } else if ($('.error-message:not(.ng-hide)').length === 0) {
          $scope.update();

          usersService.updateUser(userId, $scope.userUpdated).then(
            function success (config) {
              $state.go('page.users.group', {}, { reload: true });
            },

            function failed (err) {
              if (err.status === 400 && _.find(err.data, function (data) {
                  return data.path === 'password';
                })) {
                $scope.errorPassword = true;
              }

              if (err.status === 409) {
                $scope.errorInvalidVersion = true;
              }

              console.log("error:", err);
            });
        }
      };

      $scope.update = function () {
        $scope.userUpdated = angular.copy($scope.user);

        if ($scope.userUpdated.password.length !== 0) {
          $scope.userUpdated.password = $base64.encode($scope.userUpdated.password);
        }
      };

      $scope.checkExistingEmail = function () {
        $scope.errorEmailPattern = false;

        validateService.validate({ field: 'email', value: $scope.user.email }, $scope.user._id).then(
          function success () {
            $scope.errorExistingEmail = false;
          },

          function failed () {
            $scope.errorExistingEmail = true;
          }
        );

      };

      $scope.checkExistingUsername = function () {
        validateService.validate({ field: 'username', value: $scope.user.username }, $scope.user._id).then(
          function success () {
            $scope.errorExistingUsername = false;
          },

          function failed () {
            $scope.errorExistingUsername = true;
          }
        );
      };

      $scope.$watch('editUserForm.username.$error.pattern', function () {
        $scope.errorUsernamePattern = $scope.editUserForm.username.$error.pattern;
      });

      $scope.addFieldsErrors = function () {
        var fields = {
          firstName: [{ minlength: 2 }, { maxlength: 60 }, 'required'],
          lastName: [{ minlength: 2 }, { maxlength: 60 }, 'required'],
          username: [{ minlength: 5 }, { maxlength: 13 }, 'required', 'errorUsernamePattern', 'errorExistingUsername'],
          phone:  ['errorPhoneMaxLength', 'errorPhoneMinLength', 'required'],
          email: [{ minlength: 3 }, { maxlength: 60 }, 'required', 'email', 'errorExistingEmail', 'errorEmailPattern'],
          password: [{ minlength: 8 }, { maxlength: 20 }, 'errorPassword']
        };

        _.map(_.pairs(fields), function (field) {
          $scope.errors[field[0]] = errorsService.getFieldErrorsHtml(field[0], field[1], 'editUserForm');
        });
      };

      $scope.addFieldsErrors();
    });

})();
