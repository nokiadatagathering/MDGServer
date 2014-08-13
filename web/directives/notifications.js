define(function () {
  'use strict';
  return  function () {
    return {
      restrict: 'AC',
      replace: false,
      scope: {
        nfEvent: '&'
      },
      controller: [
        '$scope', '$element', '$attrs', '$rootScope', '$window', function ($scope, $element, $attrs, $rootScope, $window) {
          var nfMessage;

          $scope.events = [];

          $($window).scroll(function (eventObject) {
            if ($(eventObject.target).scrollTop() > 60) {
              $('.notifications').addClass('fixed');
            } else {
              $('.notifications').removeClass('fixed');
            }
          });

          // Events listeners
          $scope.$on('deleted_result', function (event, surveyId, resultIds, surveyTitle) {
            nfMessage = "Deleted " + resultIds.length + " results for '" + surveyTitle + "' survey";

            $scope.events.unshift({
              type: event.name,
              name: 'results',
              surveyId: surveyId,
              resultIds: resultIds,
              label: nfMessage,
              action: 'Undo',
              red: true
            });

            resultIds.map(function (resultId) {
              $('#' + resultId).slideUp();
              $rootScope.selectedResults = [];
            });
          });

          $scope.$on('deleted_user', function (event, userId, userName) {
            nfMessage = "Deleted user " + userName;
            $('#' + userId).slideUp();

            $scope.events.unshift({
              type: event.name,
              name: 'users',
              eventId: userId,
              label: nfMessage,
              action: 'Undo',
              red: true
            });
          });

          $scope.$on('deleted_group', function (event, groupId, groupName) {
            nfMessage = "Deleted group " + groupName;
            $('#' + groupId).slideUp();

            $scope.events.unshift({
              type: event.name,
              name: 'groups',
              eventId: groupId,
              label: nfMessage,
              action: 'Undo',
              red: true
            });
          });

          $scope.$on('deleted_survey', function (event, surveyId, surveyTitle) {
            nfMessage = "Deleted survey " + surveyTitle;
            $('#' + surveyId).slideUp();

            $scope.events.unshift({
              type: event.name,
              name: 'surveys',
              eventId: surveyId,
              label: nfMessage,
              action: 'Undo',
              red: true
            });
          });

          $scope.$on('choose_results', function (event, type) {
            nfMessage = "Choose results to " + type;

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 4,
              hideCounter: true
            });
          });

          $scope.$on('wrong_survey_type', function (event) {
            nfMessage = "Only XML file format";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 4,
              hideCounter: true
            });
          });

          $scope.$on('wrong_file_type', function (event) {
            nfMessage = "Only CSV file format";
            $scope.events.unshift({ type: event.name, label: nfMessage, action: 'Hide', red: 'true' });
          });

          $scope.$on('wrong_xml_format', function (event) {
            nfMessage = "XML is not well formed";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 6,
              hideCounter: true
            });
          });

          $scope.$on('saved_survey', function (event, title) {
            nfMessage = "Survey '" + title + "' was saved";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('archive_survey', function (event, title) {
            nfMessage = "Survey '" + title + "' was added to archive";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('restore_survey', function (event, title) {
            nfMessage = "Survey '" + title + "' was restored from archive";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('duplicate_survey', function (event, title) {
            nfMessage = "Survey '" + title + "' was duplicated";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('invalid_survey', function (event, title) {
            nfMessage = "Can not save this survey! It has some errors";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('empty_question', function (event, type) {
            nfMessage = type + " question should have at least one option";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('empty_category', function (event) {
            nfMessage = "Category should have at least one question";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('empty_survey', function (event) {
            nfMessage = "Survey should have at least one category";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('invalid_version', function (event, type) {
            nfMessage = "This " + type + " has been changed. Please, refresh the page";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: true,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('publish_survey', function (event, title) {
            nfMessage = "Survey '" + title + "' was successfully sent";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });
        }
      ],
      template: '<div><div class="event" ng-repeat="event in events" nf-event="event" ng-class="{red: event.red}"></div></div>'
    };
  };
});
