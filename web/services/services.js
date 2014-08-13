define([
  'services/autocompleteManager',

  'services/chartManager',
  'services/profileManager',
  'services/groupsManager',
  'services/usersManager',
  'services/resultsManager',
  'services/smsManager',
  'services/subscriptionManager',
  'services/surveysManager',

  'services/errorsManager',
  'services/validateManager'

], function (
  autocompleteManager,

  chartManager,
  profileManager,
  groupsManager,
  usersManager,
  resultsManager,
  smsManager,
  subscriptionManager,
  surveysManager,

  errorsManager,
  validateManager
  ) {
  'use strict';

  var services = {
      autocompleteManager: autocompleteManager,

      chartManager:        chartManager,
      profileManager:      profileManager,
      groupsManager:       groupsManager,
      usersManager:        usersManager,
      resultsManager:      resultsManager,
      smsManager:          smsManager,
      subscriptionManager: subscriptionManager,
      surveysManager:      surveysManager,

      errorsManager:       errorsManager,
      validateManager:     validateManager
    },

    initialize = function (angModule) {
      for (var name in services) {
        if (services.hasOwnProperty(name)) {
          angModule.factory(name, services[name]);
        }
      }
    };

  return {
    initialize: initialize
  };
});
