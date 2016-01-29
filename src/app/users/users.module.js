(function () {
  'use strict';

  angular.module('mdg.app.users', [])
    .config(function ($stateProvider) {
      $stateProvider
        .state('page.users', {
          url: '/users',
          templateUrl: 'app/users/groups/users.groups.html',
          controller: 'GroupsController',
          resolve: {
            groups: ['groupsService',
              function (groupsService) {

                return groupsService.groupList().then(
                function success(config) {
                  return config.data;
                },

                function failed(err) {
                  console.log("error:", err);
                });
            }],

            allUsers: ['usersService', function (usersService) {
              return usersService.userList().then(
                function success(config) {
                  return config.data;
                },

                function failed(err) {
                  console.log("error:", err);
                });
            }]
          }
        })
        .state('page.users.group', {
          url: '/group:{groupId}',
          templateUrl: 'app/users/users.list.html',
          controller: 'UsersController',
          resolve: {
            groupData: ['groupsService', '$stateParams',
              function (groupsService, $stateParams) {

                if ($stateParams.groupId) {
                  return groupsService.groupData($stateParams.groupId).then(
                    function success (config) {
                      return config.data;
                    },

                    function failed (err) {
                      console.log("error:", err);
                    });
                }
              }],

            users: ['usersService','groupsService', '$stateParams',
              function (usersService, groupsService, $stateParams) {

                if ($stateParams.groupId) {
                return groupsService.groupData($stateParams.groupId).then(
                  function success (config) {
                    return config.data.users;
                  },

                  function failed (err) {
                    console.log("error:", err);
                  });
              } else {
                return usersService.userList().then(
                  function success (config) {
                    return config.data;
                  },

                  function failed (err) {
                    console.log("error:", err);
                  });
              }
            }]
          }
        })
        .state('page.users.group.smstogroup', {
          url: '/sms',
          templateUrl: 'app/users/sms-to-group/user.group.sms.html',
          controller:'GroupSmsController'
        })
        .state('page.users.group.smstouser', {
          url: '/sms:{userId}',
          templateUrl: 'app/users/sms-to-user/user.sms.html',
          controller:'UserSmsController'
        })
        .state('page.users.group.edituser', {
          url: '/edit:{userId}',
          templateUrl: 'app/users/edit/users.edit.html',
          controller: 'UsersEditController'
        })
        .state('page.users.group.adduser', {
          url: '/adduser',
          templateUrl: 'app/users/add/user.add.html',
          controller: 'UsersAddController'

        })

    });
})();
