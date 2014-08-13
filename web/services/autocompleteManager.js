define(function () {
  'use strict';
  return function ($q, $http) {
    /** @const */
    var AUTOCOMPLETE_URL = 'autocomplete/';

    function getValues (type) {
      return $http.get(AUTOCOMPLETE_URL + type)
        .success(function (result) {
        });
    }

    return {
      getValues: getValues
    };
  };
});
