(function () {
  'use strict';
  angular.module('mdg.app.surveys')
    .controller('SendSurveyController',
    function ($scope, $http, $location, $window, $rootScope, $state,
              surveysService,
              groupsService,
              usersService) {
      $scope.groups = {};
      $scope.allUsers = {};
      $scope.allUsers.checked = false;
      $scope.allUsers.isVisible = false;

      $scope.getGroupList = function () {
        groupsService.groupList().then(
          function success(config) {
            $scope.groups = config.data;

            _.each($scope.groups, function (group) {
              group.isVisible = false;
            });
          },

          function failed(err) {
            console.log("error:", err);
          });
      };

      $scope.getAllUsers = function () {
        usersService.userList().then(
          function success(config) {
            $scope.allUsers = config.data;
            _.each($scope.allUsers, function (user) {
              user.checked = false;
            });
          },

          function failed(err) {
            console.log("error:", err);
          });
      };

      $scope.getGroupList();
      $scope.getAllUsers();

      $scope.checkAllUsersInGroup = function (usersInGroup) {
        _.each(usersInGroup, function (userFromGroup) {
          userFromGroup.checked = usersInGroup.checked;

          _.each($scope.allUsers, function (user) {
            if (userFromGroup.username == user.username) {
              user.checked = usersInGroup.checked;
            }
          });
        });
      };

      $scope.checkAllUsers = function (users) {

        for (var i = 0; i < users.length; i++) {
          users[i].checked = users.checked;

          for (var j = 0; j < $scope.allUsers.length; j++) {
            if (users[i].username == $scope.allUsers[j].username) {
              $scope.allUsers[j].checked = users.checked;
            }
          }
        }

        for (var group in $scope.groups) {
          $scope.groups[group].users.checked = $scope.allUsers.checked;

          for (var k = 0; k < $scope.groups[group].users.length; k++) {
            $scope.groups[group].users[k].checked = $scope.allUsers.checked;
          }
        }
      };

      $scope.checkUser = function (users, user, type) {
        if (_.find(users, function (val) {
            return !val.checked;
          })) {
          users.checked = false;
        }

        if (_.filter(users, function (val) {
            return val.checked;
          }).length == users.length) {
          users.checked = true;
        }

        if (type == 'group') {
          for (var i = 0; i < $scope.allUsers.length; i++) {
            if (user.username == $scope.allUsers[i].username) {
              $scope.allUsers[i].checked = user.checked;
            }
          }
        }

        if (type == 'allUsers') {
          for (var group in $scope.groups) {
            for (var j = 0; j < $scope.groups[group].users.length; j++) {
              if ($scope.groups[group].users[j].username == user.username) {
                $scope.groups[group].users[j].checked = user.checked;
              }
            }
          }
        }
      };

      $scope.sendSurvey = function (surveyId) {
        $scope.usersIds = _($scope.allUsers)
          .chain()
          .filter(function (val) {
            return val.checked;
          })
          .pluck('_id')
          .value();


        if ($scope.usersIds.length !== 0) {
          console.log('$scope.usersIds', $scope.usersIds);
          surveysService.sendSurvey(surveyId, {users: $scope.usersIds}).then(
            function success() {
              var survey = _.find($scope.$parent.$parent.surveys, function (survey) {
                return survey._id === surveyId;
              });

              survey.published = true;

              $rootScope.$broadcast('publish_survey', survey.title);
              $state.go('^');
            },

            function failed(err) {
              console.log("error:", err);
            });
        }
      };
    });
})();
