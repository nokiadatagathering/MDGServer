define([
  'controllers/LoginCtrl',
  'controllers/GroupsCtrl',
  'controllers/UsersCtrl',
  'controllers/AddUserCtrl',
  'controllers/EditUserCtrl',
  'controllers/SurveysCtrl',
  'controllers/SendSurveyCtrl',
  'controllers/EditSurveyCtrl',

  'controllers/PageCtrl',
  'controllers/ForgotPasswordCtrl',
  'controllers/ResetPasswordCtrl',
  'controllers/RegisterCtrl',
  'controllers/ResultsCtrl',
  'controllers/ResultsOnMapCtrl',
  'controllers/ResultDetailsCtrl',
  'controllers/ResultsChartCtrl',
  'controllers/BuilderCtrl'

], function (
  LoginCtrl,

  GroupsCtrl,
  UsersCtrl,
  AddUserCtrl,
  EditUserCtrl,
  SurveysCtrl,
  SendSurveyCtrl,
  EditSurveyCtrl,

  PageCtrl,
  ForgotPasswordCtrl,
  ResetPasswordCtrl,
  RegisterCtrl,
  ResultsCtrl,
  ResultsOnMapCtrl,
  ResultDetailsCtrl,
  ResultsChartCtrl,
  BuilderCtrl
  ) {
  'use strict';

  var controllers = {
      LoginCtrl:          LoginCtrl,

      GroupsCtrl:         GroupsCtrl,
      UsersCtrl:          UsersCtrl,
      AddUserCtrl:        AddUserCtrl,
      EditUserCtrl:       EditUserCtrl,
      SurveysCtrl:        SurveysCtrl,
      SendSurveyCtrl:     SendSurveyCtrl,
      EditSurveyCtrl:     EditSurveyCtrl,

      PageCtrl:           PageCtrl,
      ForgotPasswordCtrl: ForgotPasswordCtrl,
      ResetPasswordCtrl:  ResetPasswordCtrl,
      RegisterCtrl:       RegisterCtrl,
      ResultsCtrl:        ResultsCtrl,
      ResultsOnMapCtrl:   ResultsOnMapCtrl,
      ResultDetailsCtrl:  ResultDetailsCtrl,
      ResultsChartCtrl:   ResultsChartCtrl,
      BuilderCtrl:        BuilderCtrl
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
