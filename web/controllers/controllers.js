define([
  'controllers/GroupsCtrl',
  'controllers/UsersCtrl',
  'controllers/AddUserCtrl',
  'controllers/EditUserCtrl',
  'controllers/SurveysCtrl',
  'controllers/SendSurveyCtrl',
  'controllers/EditSurveyCtrl',

  'controllers/PageCtrl',
  'controllers/ResultsCtrl',
  'controllers/ResultsOnMapCtrl',
  'controllers/ResultDetailsCtrl',
  'controllers/ResultsChartCtrl'

], function (
  GroupsCtrl,
  UsersCtrl,
  AddUserCtrl,
  EditUserCtrl,
  SurveysCtrl,
  SendSurveyCtrl,
  EditSurveyCtrl,

  PageCtrl,
  ResultsCtrl,
  ResultsOnMapCtrl,
  ResultDetailsCtrl,
  ResultsChartCtrl
  ) {
  'use strict';

  var controllers = {
      GroupsCtrl:         GroupsCtrl,
      UsersCtrl:          UsersCtrl,
      AddUserCtrl:        AddUserCtrl,
      EditUserCtrl:       EditUserCtrl,
      SurveysCtrl:        SurveysCtrl,
      SendSurveyCtrl:     SendSurveyCtrl,
      EditSurveyCtrl:     EditSurveyCtrl,

      PageCtrl:           PageCtrl,
      ResultsCtrl:        ResultsCtrl,
      ResultsOnMapCtrl:   ResultsOnMapCtrl,
      ResultDetailsCtrl:  ResultDetailsCtrl,
      ResultsChartCtrl:   ResultsChartCtrl
    },

    initialize = function (angModule) {
      for (var name in controllers) {
        if (controllers.hasOwnProperty(name)) {
          angModule.controller(name, controllers[name]);
        }
      }
    };

  return {
    initialize: initialize
  };
});
