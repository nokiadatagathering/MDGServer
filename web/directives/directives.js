define([
  'directives/expand',
  'directives/errorsblock',
  'directives/validatephonenumber',
  'directives/validatePattern',
  'directives/timeSelector',
  'directives/questionBuilder',
  'directives/cascadeQuestion',
  'directives/dateInput',
  'directives/dateRange',
  'directives/csvOptioinsImport',
  'directives/notifications',
  'directives/nfEvent',
  'directives/fileSelect',
  'directives/autoComplete',
  'directives/focusMe'

], function (
  expand,
  errorsblock,
  validatephonenumber,
  validatePattern,
  timeSelector,
  questionBuilder,
  cascadeQuestion,
  dateInput,
  dateRange,
  csvOptioinsImport,
  notifications,
  nfEvent,
  fileSelect,
  autoComplete,
  focusMe
  ) {
  'use strict';

  var directives = {
      expand: expand,
      errorsblock: errorsblock,
      validatephonenumber: validatephonenumber,
      validatePattern: validatePattern,
      timeSelector: timeSelector,
      questionBuilder: questionBuilder,
      cascadeQuestion: cascadeQuestion,
      dateInput: dateInput,
      dateRange: dateRange,
      csvOptioinsImport: csvOptioinsImport,
      notifications: notifications,
      nfEvent: nfEvent,
      fileSelect: fileSelect,
      autoComplete: autoComplete,
      focusMe: focusMe

    },

    initialize = function () {
      for (var name in directives) {
        if (directives.hasOwnProperty(name)) {
          angular.module(name, []).directive(name, directives[name]);
        }
      }
    };

  return {
    initialize: initialize
  };
});
