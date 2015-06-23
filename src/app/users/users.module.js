(function () {
  'use strict';

  angular.module('mdg.app.users', [])
    .config(function ($stateProvider) {
      $stateProvider
        .state('page.users', {
          url: '/users',
          templateUrl: 'app/users/groups/users.groups.html',
          controller: 'GroupsController'
        })
        .state('page.users.group', {
          url: '/group:{groupId}',
          templateUrl: 'app/users/users.list.html',
          controller: 'UsersController'
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
