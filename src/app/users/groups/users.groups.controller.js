(function () {
  'use strict';

  angular.module('mdg.app.users').controller('GroupsController',
    function ($scope, $http, $location, $window, $stateParams, $rootScope,
               groupsService,
               usersService,
               errorsService,
               smsService,
              groups,
              allUsers
          ) {
    $scope.groups = groups;
    $scope.deletedGroups = [];
    $scope.allUsers = allUsers;
    $scope.smsText = '';
    $scope.errors = {};

    $scope.showNewGroup = false;

    if ($rootScope.loggedInUser.permission === 'operator') {
      $window.location = '#/surveys';
    }

    $scope.getGroupList = function () {
      groupsService.groupList().then(
        function success(config) {
          $scope.groups = config.data;
        },

        function failed(err) {
          console.log("error:", err);
        });
    };

    $scope.getAllUsers = function () {
      usersService.userList().then(
        function success(config) {
          $scope.allUsers = config.data;
        },

        function failed(err) {
          console.log("error:", err);
        });
    };

    $scope.getGroupName = function () {
      if ($stateParams.groupId) {
        groupsService.groupData($stateParams.groupId).then(
          function success(config) {
            $scope.groupName = config.data.name;
          },

          function failed(err) {
            console.log("error:", err);
          });
      }
    };

    $scope.sendSms = function () {
     smsService.sendSMStoGroup($stateParams.groupId, {sms: $scope.smsText}).then(
        function success(config) {
          $rootScope.back();
        },

        function failed(err) {
          console.log("error:", err);
        });
    };

    $scope.saveNewGroup = function (groupName) {
      if (groupName) {
        groupsService.createGroup(groupName).then(
          function success(config) {
            $scope.getGroupList();
            $scope.showNewGroup = false;
          },

          function failed(err) {
            if (err.status === 400) {
              $scope.errorExistingGroupName = true;
            }
            console.log("error:", err);
          });
      } else {
        $scope.showNewGroup = false;
      }
    };

    $scope.addFieldsErrors = function () {
      var fields = {
        groupName: [{minlength: 2}, {maxlength: 60}, 'errorExistingGroupName']
      };

      _.map(_.pairs(fields), function (field) {
        $scope.errors[field[0]] =errorsService.getFieldErrorsHtml(field[0], field[1], 'newGroup');
      });
    };

    $scope.addFieldsErrors();

    $scope.deleteGroup = function (groupId, groupName) {
      $rootScope.deletedItems.groups.push(groupId);
      $rootScope.$broadcast('deleted_group', groupId, groupName);
    };

    $rootScope.$on('updated_group', function (event, groupId) {
      $scope.getGroupList(groupId);
    });

    $rootScope.$on('update_users_count', function (event, groupId) {
      $scope.getGroupList();
      $scope.getAllUsers();
    });
  });
})();
