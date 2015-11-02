(function () {
  'use strict';
  angular.module('mdg.app.results').controller('resultsChartController',
    function ($scope, $rootScope, $http, $location, $window, surveysService, resultsChartService, $stateParams) {
    $scope.surveyTitle = '';
    $scope.questions = [];

    $scope.createBarChart = function (data, id) {
      var
        margin = { top: 20, right: 5, bottom: 60, left: 55 },
        width = 570 - margin.left - margin.right,
        height = 330 - margin.top - margin.bottom,

        tip = d3.tip()
          .attr('class', 'd3-tip')
          .html(function (d) {
            return '<span>' + d.value + '</span>';
          }),

        tickStep = Math.ceil(d3.max(data, function (d) {
          return d.value + 1;
        }) / 10),

        x = d3.scale.ordinal()
          .rangeRoundBands([0, width], '.1'),

        y = d3.scale.linear()
          .range([height, 0]),

        xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(0)
          .tickPadding(10)
          .orient("bottom"),

        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickSize(0)
          .tickValues(function () {
            var yTickValues = [];

            for (var i = 0; i <= tickStep * 10; i = (i + tickStep)) {
              yTickValues.push(i);
            }

            return yTickValues;
          })
          .tickPadding(10)
          .ticks(d3.max(data, function (d) {
            return d.value;
          })),

        svg = d3.select(".bar-" + id).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(data.map(function (d) {
        return d.category;
      }));

      y.domain([0, d3.max(data, function (d) {
        return d.value + 1;
      })]);

      svg.call(tip);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("y", 50)
        .attr("x", 170)
        .style("text-anchor", "start")
        .text("Respondent's answer");

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -100)
        .style("text-anchor", "end")
        .text("Respondents");

      svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return x(d.category);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
          return y(d.value);
        })
        .attr("height", function (d) {
          return height - y(d.value);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    };

    $scope.createPieChart = function (data, id) {
      data = _.sortBy(data, function (item) {
        return item.value;
      }).reverse();

      var
        radius = 110,
        width = 570,
        height = 330,

        color = d3.scale.category20c(),

        vis = d3.select(".pie-" + id)
          .append("svg:svg")
          .data([data])
          .attr("width", width)
          .attr("height", height)
          .append("svg:g")
          .attr("transform", "translate(" + height / 2 + "," + height / 2 + ")"),

        arc = d3.svg.arc()
          .outerRadius(radius),

        pie = d3.layout.pie()
          .value(function (d) {
            return d.value;
          }),

        arcs = vis.selectAll("g.slice")
          .data(pie)
          .enter()
          .append("svg:g")
          .attr("class", "slice");

      arcs.append("svg:path")
        .attr("fill", function (d, i) {
          return color(i);
        })
        .attr("d", arc);

      arcs.append("svg:text")
        .attr("transform", function (d, i) {
          d.innerRadius = 170;
          d.outerRadius = radius;
          return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d, i) {
          var percents = data[i].percents.toFixed(1);

          return (percents < 5) ? '' : data[i].percents.toFixed(1) + '%';
        });

      d3.select(".pie-" + id + " svg").append("svg:g")
        .attr("transform", "translate(340, 80)")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
          return "translate(0," + i * 20 + ")";
        });

      d3.selectAll(".pie-" + id + ' g.legend').append("circle")
        .attr("r", 9)
        .style("fill", function (d, i) {
          return color(i);
        });

      d3.selectAll(".pie-" + id + ' g.legend').append("text")
        .attr("x", 24)
        .attr("dy", ".35em")
        .text(function (d, i) {
          return data[i].percents.toFixed(1) + '%, ' + data[i].label;
        });
    };

    $scope.getSurveyInfo = function () {
      surveysService.surveyInfo($stateParams.surveyId).then(
        function success (config) {
          var survey = config.data;

          $scope.surveyTitle = survey.title;

          _.each(survey._categories, function (category) {
            _.each(category._questions, function (question) {
              if (question.type === 'select1' || question.type === 'int') {
                question.chart = {
                  isVisible: false,
                  image: config.data.imageUrl
                };

                if (question.type === 'int') {
                  question.chart.type = 'bar';
                }

                if (question.type === 'select1') {
                  question.chart.type = 'pie';
                }

                $scope.questions.push(question);
              }
            });
          });
        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.renderChart = function (index, type) {
      if ($scope.questions[index].chart.rendered) {
        return;
      }

      resultsChartService.getChartData({
        survey: $stateParams.surveyId,
        question: $scope.questions[index].id,
        results: $scope.selected.results
      }).then(
        function success (config) {
          if (type === 'bar') {
            $scope.createBarChart(config.data, $scope.questions[index].id);
            $scope.questions[index].chart.rendered = true;
          } else if (type === 'pie') {
            $scope.createPieChart(config.data, $scope.questions[index].id);
            $scope.questions[index].chart.rendered = true;
          }
        },

        function failed (err) {
          console.log("error:", err);
        });

      resultsChartService.getChartUrl({
        survey: $stateParams.surveyId,
        question: $scope.questions[index].id,
        results: $scope.selected.results
      }).then(
        function success (config) {
          $scope.questions[index].chart.url = config.data.imageUrl;

        },

        function failed (err) {
          console.log("error:", err);
        });
    };

    $scope.getSurveyInfo();
  });
})();
