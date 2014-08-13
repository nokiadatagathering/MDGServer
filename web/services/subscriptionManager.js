define(function () {
  'use strict';
  return function ($q, $http) {
    /** @const */
    var
      SUBSCRIPTION_URL = '/subscriptions',
      SURVEY_URL = '/surveys/';

    function createSubscription (surveyId, subscriptionData) {
      var create_url = SURVEY_URL + surveyId + SUBSCRIPTION_URL;

      return $http.post(create_url, subscriptionData)
        .success(function (result) {
        });
    }

    function subscriptionList (surveyId) {
      var list_url = SURVEY_URL  + surveyId + SUBSCRIPTION_URL;

      return $http.get(list_url)
        .success(function (result) {
        });
    }

    function deleteSubscription (surveyId, resultId) {
      var delete_url = SURVEY_URL  + surveyId + SUBSCRIPTION_URL + '/' + resultId;

      return $http.delete(delete_url)
        .success(function (result) {
        });
    }

    return {
      createSubscription: createSubscription,
      subscriptionList: subscriptionList,
      deleteSubscription: deleteSubscription
    };
  };
});
