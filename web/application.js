define([
  'angular',
  'services/services',
  'controllers/controllers',
  'directives/directives',
  'config'
], function (angular, services, controllers, directives, config) {
  'use strict';
  var application = angular.module('Application',['ui.router','ui.sortable',
    'ngDragDrop', 'ngSanitize', 'ngDropdowns',
    'config', 'base64',
    'expand', 'errorsblock', 'validatephonenumber', 'validatePattern',
    'timeSelector', 'questionBuilder', 'cascadeQuestion',
    'dateInput', 'dateRange',
    'csvOptioinsImport',
    'notifications', 'nfEvent',
    'fileSelect', 'autoComplete','focusMe'
  ], function ($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    $httpProvider.defaults.transformRequest = [function (data) {
      /**
       *
       * @param {Object} obj
       * @return {String}
       */
      var param = function (obj) {
        var query = '',
            name, value, fullSubName, subValue, innerObj, i, subName;

        for (name in obj) {
          value = obj[name];
          if (value instanceof Array) {
            for (i = 0; i < value.length; ++i) {
              subValue = value[i];
              fullSubName = name + '[' + i + ']';
              innerObj = {};
              innerObj[fullSubName] = subValue;
              query += param(innerObj) + '&';
            }
          } else if (value instanceof Object) {
            for (subName in value) {
              subValue = value[subName];
              fullSubName = name + '[' + subName + ']';
              innerObj = {};
              innerObj[fullSubName] = subValue;
              query += param(innerObj) + '&';
            }
          } else if (value !== undefined && value !== null) {
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
          }
        }

        return query.length ? query.substr(0, query.length - 1) : query;
      };

      return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];

    var interceptor = ['$rootScope', '$q','$window', function (scope, $q, $window, $location) {

      function success (response) {
        return response;
      }

      function error (response) {
        var status = response.status;

        if (status == 401) {
          window.document.location.href = '/home';
        }

        return $q.reject(response);
      }

      return function (promise) {
        return promise.then(success, error);
      };
    }];

    $httpProvider.responseInterceptors.push(interceptor);
  });

  services.initialize(application);
  controllers.initialize(application);
  directives.initialize(application);

  application.filter('cascadeFilter', [function () {
    return function (questions) {
      var exp = new RegExp('cascade([^1]\\d*|\\d{2,})'),
          tempQuestions = [];
      angular.forEach(questions, function (question) {
          if (!exp.test(question.type)) {
            tempQuestions.push(question);
        }
      });
      return tempQuestions;
      };
  }]);

  application.filter('deletedItemsFilter', ['$rootScope', function ($rootScope) {
    return function (items, type) {
      angular.forEach(items, function (item) {
        if (_.find($rootScope.deletedItems[type], function (id) {
          return id === item._id;
        })) {
          item.hidden = true;
        }
      });

      return items;
    };
  }]);

  application.config(function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider
      .otherwise('/surveys');
    $urlRouterProvider.when('', '/surveys');
    $stateProvider
      .state('page', {
        url: '',
        templateUrl: '/partials/Page.html'
      })
      .state('page.surveys', {
        url: '/surveys',
        templateUrl: '/partials/SurveyList.html'
      })
      .state('page.surveys.sendsurvey', {
        url: '/send:{surveyId}',
        templateUrl: '/partials/ModalSendSurvey.html'
      })

      .state('page.archive', {
        url: '/archive',
        templateUrl: '/partials/Archive.html'
      })
      .state('page.archive.sendsurvey', {
        url: '/send:{surveyId}',
        templateUrl: '/partials/ModalSendSurvey.html'
      })

      .state('page.users', {
        url: '/users',
        templateUrl: '/partials/GroupList.html'
      })
      .state('page.users.group', {
        url: '/group:{groupId}',
        templateUrl: '/partials/UserList.html'
      })
      .state('page.users.group.smstogroup', {
        url: '/sms',
        templateUrl: '/partials/ModalGroupSms.html'
      })
      .state('page.users.group.smstouser', {
        url: '/sms:{userId}',
        templateUrl: '/partials/ModalUserSms.html'
      })
      .state('page.users.group.edituser', {
        url: '/edit:{userId}',
        templateUrl: '/partials/ModalEditUser.html'
      })
      .state('page.users.group.adduser', {
        url: '/adduser',
        templateUrl: '/partials/ModalAddUser.html'
      })

      .state('page.map', {
        url: '/survey:{surveyId}/map',
        templateUrl: '/partials/ResultsOnMap.html'
      })
      .state('page.map.details', {
        url: '/result:{resultId}',
        templateUrl: '/partials/ResultDetails.html'
      })
      .state('page.map.exportschedule', {
        url: '',
        templateUrl: '/partials/ModalExportSchedule.html'
      })
      .state('page.map.details.exportschedule', {
        url: '',
        templateUrl: '/partials/ModalExportSchedule.html'
      })
      .state('page.map.sentto', {
        url: '',
        templateUrl: '/partials/ModalSentToUsers.html'
      })
      .state('page.map.details.sentto', {
        url: '',
        templateUrl: '/partials/ModalSentToUsers.html'
      })

      .state('page.results', {
        url: '/survey:{surveyId}',
        templateUrl: '/partials/ResultList.html'
      })
      .state('page.results.details', {
        url: '/result:{resultId}',
        templateUrl: '/partials/ResultDetails.html'
      })
      .state('page.results.sentto', {
        url: '',
        templateUrl: '/partials/ModalSentToUsers.html'
      })
      .state('page.results.details.sentto', {
        url: '',
        templateUrl: '/partials/ModalSentToUsers.html'
      })
      .state('page.results.exportschedule', {
        url: '',
        templateUrl: '/partials/ModalExportSchedule.html'
      })
      .state('page.results.details.exportschedule', {
        url: '',
        templateUrl: '/partials/ModalExportSchedule.html'
      })
      .state('page.results.resultschart', {
        url: '',
        templateUrl: '/partials/ModalResultsChart.html'
      })
      .state('page.results.details.resultschart', {
        url: '',
        templateUrl: '/partials/ModalResultsChart.html'
      })

      .state('page.builder', {
        url: '/builder',
        templateUrl: '/partials/EditSurvey.html'
      })
      .state('page.editsurvey', {
        url: '/editsurvey:{surveyId}',
        templateUrl: '/partials/EditSurvey.html'
      });
  });

  application.run(function ($templateCache, $rootScope, $location, $state, $stateParams, profileManager, $anchorScroll) {
    if (window.addTemplatesToCache) {
      window.addTemplatesToCache($templateCache);
    }
    $rootScope.generateUUID = function () {
      return 'id_' + UUIDjs.create().toString().replace(/-/g, '_');
    };

    $rootScope.$on('$stateChangeSuccess', function () {
      $location.hash($rootScope.scrollTo);
      $anchorScroll();
      $rootScope.scrollTo = null;
    });

    $rootScope.version = window.version;
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.goState = function (state, stateParams) {
      $rootScope.scrollTo = stateParams ? stateParams.scrollTo : undefined;
      $state.go(state, stateParams);
    };
    $rootScope.setRoute = function (route) {
      $location.path(route);
    };
    $rootScope.back = function () {
      window.history.back();
    };

    $rootScope.deletedItems = {
      surveys: [],
      users:   [],
      groups:  [],
      results: []
    };

    $rootScope.logout = function () {
      var logout = function () {
        profileManager.logout().then(
          function success () {
            window.document.location.href = '/home';
          },

          function failed (err) {
            console.log("error:", err);
          });
      };

      if ($location.$$path.indexOf('/editsurvey:') !== -1 || $location.$$path.indexOf('/builder') !== -1) {
        $rootScope.goState('page.surveys');

        $rootScope.saveSurveyPromise.then(
          function success () {
            logout();
          });
      } else {
        logout();
      }
    };

    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if (toState.name.indexOf("pageGetStarted") === -1) {
        profileManager.getUserPermission().then(
          function success (config) {
            $rootScope.loggedInUser = config.data;
          },

          function failed (err) {
            console.log("error:", err);
          });
      }
    });

  });
  return application;
});
