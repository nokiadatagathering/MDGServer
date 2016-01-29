(function () {
  'use strict';
  angular.module('mdg.app.results').controller('resultsMapController',
    function ($scope, $rootScope, $http, $stateParams, $state, resultMapService, nokia_app_id, nokia_app_code) {
    var
      mapContainer,
      markers = [],
      map = {},
      infoBubbles = new nokia.maps.map.component.InfoBubbles(),
      TOUCH = nokia.maps.dom.Page.browser.touch,
      CLICK = TOUCH ? 'tap' : 'click';

    mapContainer = document.getElementById("mapContainer");

    map = new nokia.maps.map.Display(mapContainer, {
      maxZoomLevel: 15,
      zoomLevel: 2,
      components: [
        new nokia.maps.map.component.Behavior(),
        infoBubbles
      ]
    });

    nokia.Settings.set("app_id", nokia_app_id);
    nokia.Settings.set("app_code", nokia_app_code);
    nokia.Settings.set("serviceMode", "cit");

    if (document.location.protocol == "https:") {
      nokia.Settings.set("secureConnection", "force");
    }

    if ($scope.selected.results.length !== 0) {

      localStorage.setItem('selectedResults', $scope.selected.results);
    } else {
      if (localStorage.getItem('selectedResults')) {
        $scope.selected.results = localStorage.getItem('selectedResults').split(',');
      } else {
        $state.go('page.results.list.details', { surveyId: $stateParams.surveyId, resultId:  $stateParams.resultId});
      }
    }

    $scope.getMapData = function () {
      resultMapService.getChartData({ survey: $stateParams.surveyId, results: $scope.selected.results }).then(
        function success (config) {
          clusterDataPoints(config.data);
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getMapData();

    function clusterDataPoints (data) {
      var svgTheme = {
        getClusterPresentation: function (dataPoints) {
          var
            html = '',
            existedMarker,
            coordinates = dataPoints.getBounds().getCenter(),
            message = '';

          _.each(dataPoints.Bb, function (dataPoint) {
            message = message + dataPoint.user + ' ' + dataPoint.title + ' ';
            html = html + '<a href="#/survey:' +
            $stateParams.surveyId +
            '/map/result:' +
            dataPoint.id +
            '"><b>' +
            dataPoint.title +
            '</b><br>Collected by: ' +
            dataPoint.user +
            '</a><br>';
          });

          if (dataPoints.getSize() > 0) {
            var cluster =  new nokia.maps.map.StandardMarker(coordinates, {
              text: dataPoints.getSize(),
              html: html,
              message: message
            });

            cluster.$boundingBox = dataPoints.getBounds();

            cluster.addListener(CLICK,
              function (evt) {
                if (map.zoomLevel === map.maxZoomLevel) {
                  infoBubbles.options.set('backgroundColor', 'white');
                  infoBubbles.options.set('color', 'black') ;

                  cluster.bubble = infoBubbles.openBubble(evt.target.html, evt.target.coordinate);
                }
              }
            );

            existedMarker = _.find(markers, function (m, index) {
              if ((m.coordinate.latitude === coordinates.latitude) && (m.coordinate.longitude === coordinates.longitude)) {
                markers[index] = cluster;
                return true;
              }
            });

            if (!existedMarker) {
              markers.push(cluster);
            }

            return cluster;
          }
        },

        getNoisePresentation: function (dataPoint) {
          var
            existedMarker,
            marker =  new nokia.maps.map.StandardMarker([dataPoint.latitude, dataPoint.longitude], {
              _id: dataPoint.id,
              message: dataPoint.user + ' ' + dataPoint.title,
              html: '<a href="#/survey:' +
              $stateParams.surveyId +
              '/map/result:' +
              dataPoint.id +
              '"><b>' +
              dataPoint.title +
              '</b><br>Collected by: ' +
              dataPoint.user + '</a>'
            });

          marker.addListener(CLICK,
            function (evt) {
              infoBubbles.options.set('backgroundColor', 'white');
              infoBubbles.options.set('color', 'black') ;

              marker.bubble = infoBubbles.openBubble(evt.target.html, evt.target.coordinate);
            }
          );

          existedMarker = _.find(markers, function (m, index) {
            if (m._id === dataPoint.id) {
              markers[index] = marker;
              return true;
            }
          });

          if (!existedMarker) {
            markers.push(marker);
          }

          return  marker;
        }
      };

      $scope.clusterProvider = new nokia.maps.clustering.ClusterProvider(map, {
        eps: 16,
        minPts: 1,
        dataPoints: data,
        theme: svgTheme
      });

      $scope.clusterProvider.cluster();

      addZoomToListener(map);
    }

    function addZoomToListener (map) {
      map.addListener(CLICK, function (evt) {
        if (evt.target.$boundingBox !== undefined) {
          evt.display.zoomTo(evt.target.$boundingBox, false);
        }
      });
    }

    $scope.$watch('searchQuery', function (newValue) {
      _.each(markers, function (marker) {
        marker.set("brush", { color: "#1080DD" });

        if (marker.ri && newValue.length !== 0 && marker.message.toLowerCase().indexOf(newValue.toLowerCase()) !== -1) {

          marker.set("brush", { color: "#558a10" });
        }
      });
    });
  });
})();
