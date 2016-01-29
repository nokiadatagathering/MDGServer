(function () {
  'use strict';
  angular.module('mdg.app.validation', [])
    .service('validateService',function ($q, $http) {
    /** @const */
    var VLIDATE_URL = '/validate';

    function validate (validateParams, id) {
      return $http.post(VLIDATE_URL + '/' + id, validateParams)
        .success(function (result) {
        });
    }

    return {
      validate: validate
    };
  });
})();
