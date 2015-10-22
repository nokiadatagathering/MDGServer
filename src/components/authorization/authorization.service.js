(function () {
  'use strict';
  angular.module('mdg.app.authorization', []).service(
    'authorizationService',
    function ($q, $http) {
    /** @const */
    var
      LANGUAGES_URL = '/supportedLanguages',
      GET_USER_PERMISSION_URL = '/userPermission',
      LOGOUT_URL = '/logout',
      cacheBuster = new Date().getTime();

      function getLanguages () {
      return $http.get(LANGUAGES_URL);
    }

    function logout () {
      return $http.get(LOGOUT_URL);
    }

    function getUserPermission () {
      return $http.get(GET_USER_PERMISSION_URL + '?t=' + cacheBuster)
        .success(function (result) {
          console.log('result', result);
        });
    }

    return {
      getLanguages: getLanguages,
      logout: logout,
      getUserPermission: getUserPermission
    };
  });
})();
