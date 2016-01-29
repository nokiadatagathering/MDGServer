(function () {
  'use strict';

  angular.module('mdg.app.users').service(
    'usersService', function ($q, $http) {
      /** @const */
      var USERS_URL = '/users/';

      function userList() {
        return $http.get(USERS_URL)
          .success(function (result) {
          });
      }

      function userInfo(userId) {
        return $http.get(USERS_URL + userId)
          .success(function (result) {
          });
      }

      function createUser(userData) {
        return $http.post(USERS_URL, userData)
          .success(function (result) {
          });
      }

      function updateUser(userId, userData) {
        var update_user_url = USERS_URL + userId;
        return $http.put(update_user_url, userData)
          .success(function (result) {
          });
      }

      function deleteUser(userId) {
        var delete_user_url = USERS_URL + userId;
        return $http.delete(delete_user_url)
          .success(function (result) {
          });
      }

      return {
        userList: userList,
        userInfo: userInfo,
        createUser: createUser,
        updateUser: updateUser,
        deleteUser: deleteUser
      };
    });
})();
