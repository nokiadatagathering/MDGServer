define(function () {
  'use strict';
  return function ($q, $http) {
    /** @const */
    var
      LOGIN_URL = '/login',
      LOGOUT_URL = '/logout',
      SINGUP_URL = '/signup',
      GET_USER_PERMISSION_URL = '/userPermission',
      FORGOT_PASSWORD_URL = '/forgotPassword',
      CHECK_RESET_TOKEN_URL = '/checkResetPasswordToken',
      RESET_PASSWORD_URL = '/resetPassword';

    function login (username, password) {
      return $http.post(LOGIN_URL, { username: username, password: password });
    }

    function logout () {
      return $http.get(LOGOUT_URL);
    }

    function registration (userData) {
      return $http.post(SINGUP_URL, userData)
        .success(function (result) {
        });
    }

    function getUserPermission () {
      return $http.get(GET_USER_PERMISSION_URL)
        .success(function (result) {
        });
    }

    function forgotPassword (data) {
      return $http.post(FORGOT_PASSWORD_URL, data)
        .success(function (result) {
        });
    }

    function checkResetPasswordToken (data) {
      return $http.post(CHECK_RESET_TOKEN_URL, data)
        .success(function (result) {
        });
    }

    function resetPassword (data) {
      return $http.post(RESET_PASSWORD_URL, data)
        .success(function (result) {
        });
    }

    return {
      login: login,
      logout: logout,
      registration: registration,
      getUserPermission: getUserPermission,
      forgotPassword: forgotPassword,
      checkResetPasswordToken: checkResetPasswordToken,
      resetPassword: resetPassword
    };
  };
});
