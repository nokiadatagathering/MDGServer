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
          var
            nfMessage,
            translateValues = "";

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
            nfMessage = "notifications.deleted_result";
            translateValues = '{LENGTH:' + resultIds.length + ", TITLE:'" + surveyTitle + "'}";

            $scope.events.unshift({
              type: event.name,
              name: 'results',
              surveyId: surveyId,
              resultIds: resultIds,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Undo',
              red: true
            });

            resultIds.map(function (resultId) {
              $('#' + resultId).slideUp();
              $rootScope.selectedResults = [];
            });
          });

          $scope.$on('deleted_user', function (event, userId, userName) {
            nfMessage = "notifications.deleted_user";
            translateValues = "{userName:'" + userName + "'}";
            $('#' + userId).slideUp();

            $scope.events.unshift({
              type: event.name,
              name: 'users',
              eventId: userId,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Undo',
              red: true
            });
          });

          $scope.$on('deleted_group', function (event, groupId, groupName) {
            nfMessage = "notifications.deleted_group";
            translateValues = "{groupName:'" + groupName + "'}";
            $('#' + groupId).slideUp();

            $scope.events.unshift({
              type: event.name,
              name: 'groups',
              eventId: groupId,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Undo',
              red: true
            });
          });

          $scope.$on('deleted_survey', function (event, surveyId, surveyTitle) {
            nfMessage = "notifications.deleted_survey";
            translateValues = "{surveyTitle:'" + surveyTitle + "'}";
            $('#' + surveyId).slideUp();

            $scope.events.unshift({
              type: event.name,
              name: 'surveys',
              eventId: surveyId,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Undo',
              red: true
            });
          });

          $scope.$on('choose_results', function (event, type) {
            nfMessage = "notifications.choose_results";
            translateValues = "{TYPE:'" + type + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Hide',
              red: true,
              time: 4,
              hideCounter: true
            });
          });

          $scope.$on('wrong_survey_type', function (event) {
            nfMessage = "notifications.wrong_survey_type";

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
            nfMessage = "notifications.wrong_file_type";
            $scope.events.unshift({ type: event.name, label: nfMessage, action: 'Hide', red: 'true' });
          });

          $scope.$on('wrong_xml_format', function (event) {
            nfMessage = "notifications.wrong_xml_format";

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
            nfMessage = "notifications.saved_survey";
            translateValues = "{title:'" + title + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('archive_survey', function (event, title) {
            nfMessage = "notifications.archive_survey";
            translateValues = "{title:'" + title + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('restore_survey', function (event, title) {
            nfMessage = "notifications.restore_survey";
            translateValues = "{title:'" + title + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('duplicate_survey', function (event, title) {
            nfMessage = "notifications.duplicate_survey";
            translateValues = "{title:'" + title + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Hide',
              red: false,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('invalid_survey', function (event) {
            nfMessage = "notifications.invalid_survey";

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
            nfMessage = "notifications.empty_question";
            translateValues = "{TYPE:'" + type + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Hide',
              red: true,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('empty_category', function (event) {
            nfMessage = "notifications.empty_category";

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
            nfMessage = "notifications.empty_survey";

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
            nfMessage = "notifications.invalid_version";
            translateValues = "{type:'" + type + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
              action: 'Hide',
              red: true,
              time: 5,
              hideCounter: true
            });
          });

          $scope.$on('publish_survey', function (event, title) {
            nfMessage = "notifications.publish_survey";
            translateValues = "{title:'" + title + "'}";

            $scope.events.unshift({
              type: event.name,
              label: nfMessage,
              translateValues: translateValues,
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
