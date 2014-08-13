define(function () {
  'use strict';
  return function ($scope, $http, $location, $window, $stateParams, $rootScope,
                   groupsManager,
                   profileManager,
                   usersManager,
                   errorsManager,
                   smsManager) {

    $scope.groups = {};
    $scope.deletedGroups = [];
    $scope.groupName = '';
    $scope.allUsers = {};
    $scope.smsText = '';
    $scope.errors = {};

    $scope.showNewGroup = false;

    $scope.getUserPermission = function () {
      profileManager.getUserPermission().then(
        function success (config) {
          if (config.data.permission === 'operator') {
            $window.location = '#/surveys';
          }
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getUserPermission();

    $scope.getGroupList = function () {
      groupsManager.groupList().then(
        function success (config) {
          $scope.groups = config.data;
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getAllUsers = function () {
      usersManager.userList().then(
        function success (config) {
          $scope.allUsers = config.data;
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getGroupName = function () {
      if ($stateParams.groupId) {
        groupsManager.groupData($stateParams.groupId).then(
          function success (config) {
            $scope.groupName = config.data.name;
          },

          function failed (err) {
            console.log("error:", err);
          });
      }
    };

    $scope.getGroupList();
    $scope.getGroupName();
    $scope.getAllUsers();

    $scope.sendSms = function () {
      smsManager.sendSMStoGroup($stateParams.groupId, { sms: $scope.smsText }).then(
        function success (config) {
          $rootScope.back();
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.saveNewGroup = function () {
      if ($scope.groupName){
        groupsManager.createGroup($scope.groupName).then(
          function success (config) {
            $scope.getGroupList();
            $scope.showNewGroup = false;
          },

          function failed (err) {
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
        groupName: [{ minlength: 2 }, { maxlength: 60 }, 'errorExistingGroupName']
      };

      _.map(_.pairs(fields), function (field) {
        $scope.errors[field[0]] = errorsManager.getFieldErrorsHtml(field[0], field[1], 'newGroup');
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
  };
});
