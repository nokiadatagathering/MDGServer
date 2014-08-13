var
  d3 = require('d3'),
  temp = require('temp').track(),
  fs = require('fs'),
  xmldom = require('xmldom'),
  exec = require('child_process').exec,
  _ = require('underscore'),

  ChartRequest = require('../../models/ChartRequest'),
  Survey = require('../../models/Survey'),
  Result = require('../../models/Result'),

  Configuration = require('../../helpers/Configuration');

function collectDataForSelect1Type (results, categoryIndex, questionIndex, items) {
  var
    resultsCount = results.length,
    result,
    data = {};

  _.each(results, function (result) {
    var questionResult = result._categoryResults[categoryIndex]._questionResults[questionIndex];

    data[questionResult.result] = data[questionResult.result] ? data[questionResult.result] + 1 : 1;
  });

  result = _.map(data, function (count, value) {
    return {
      label: items[value] ? items[value] : 'No answer',
      percents: count / (resultsCount * 0.01),
      value: count
    };
  });

  return result;
}

function collectDataForIntType (results, categoryIndex, questionIndex) {
  var
    data = {},
    result = [];

  _.each(results, function (result) {
    var questionResult = result._categoryResults[categoryIndex]._questionResults[questionIndex];

    if (questionResult.result) {
      data[questionResult.result] = data[questionResult.result] ? data[questionResult.result] + 1 : 1;
    }
  });

  result = _.map(data, function (value, count) {
    return {
      value:  value,
      category: count
    };
  });

  return result;
}

function collectDataForGostampType (results) {
  var data = [];

  _.each(results, function (result) {
    if (!result.geostamp || result.geostamp.split(' ').length !== 2) {
      return;
    }

    data.push({
      title: result.title,
      user: result._user.firstName + " " + result._user.lastName,
      id: result._id,
      latitude: parseFloat(result.geostamp.split(' ')[0]),
      longitude:  parseFloat(result.geostamp.split(' ')[1])
    });
  });

  return data;
}

function getChartData (surveyId, questionId, results, owner, cb) {
  var
    categoryIndex,
    questionIndex,
    type,
    response = {},
    items = {};

  Survey.findOne({ _id: surveyId, _owner: owner }).exec(function (err, survey) {
    if (err) {
      cb({ status: 500, body: err });
      return;
    }

    if (!survey) {
      cb({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
      return;
    }

    if (questionId !== undefined) {
      _.each(survey._categories, function (category, indexCat) {
        _.each(category._questions, function (question, indexQues) {
          if (question.id.toString() === questionId.toString() && (question.type === 'select1' || question.type === 'int')) {
            categoryIndex = indexCat;
            questionIndex = indexQues;
            type = question.type;

            if (question.items) {
              _.each(question.items, function (item) {
                items[item.value] = item.text;
              });
            }

            return false;
          }
        });
      });

      if (!type) {
        cb({ status: 400, body: { name: 'ValidatorError', path: 'questionID', type: 'unknown' } });
        return;
      }
    } else {
      type = 'geostamp';
    }

    Result.find({ _id: { $in: results }, _owner: owner, _survey: survey }).populate('_user', 'firstName lastName').exec(function (err, results) {
      if (err) {
        cb({ status: 500, body: err });
        return;
      }

      if (type === 'int') {
        response =  collectDataForIntType(results, categoryIndex, questionIndex);
      } else if (type === 'geostamp') {
        response =  collectDataForGostampType(results);
      } else if (type === 'select1') {
        response =  collectDataForSelect1Type(results, categoryIndex, questionIndex, items);
      }

      cb(null, response, type);
    });
  });
}

exports.getChartData = function (req, res, next) {
  var
    surveyId = req.body.survey,
    question = req.body.question,
    results = req.body.results,
    owner = req.user.owner;

  getChartData(surveyId, question, results, owner, function (err, response) {
    if (err) {
      next(err);
      return;
    }

    res.send(response);
  });
};

exports.getChartUrl = function (req, res, next) {
  var chartRequest = new ChartRequest();

  chartRequest.body = req.body;

  chartRequest.save(function (err, chartRequest) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    res.send({ imageUrl: req.protocol + '://' + req.get('host') + '/chartImage/' + chartRequest._id });
  });
};

function createBarChart (data) {
  var
    margin = { top: 10, right: 10, bottom: 70, left: 70 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,

    x = d3.scale.ordinal()
      .rangeRoundBands([0, width], '.1'),

    y = d3.scale.linear()
      .range([height, 0]),

    xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(1)
      .tickPadding(10)
      .orient("bottom"),

    yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(1)
      .tickPadding(10)
      .ticks(d3.max(data, function (d) {
        return d.value;
      })),

    svg = d3.select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("color", "#fff")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#fff")
    .attr("transform", "translate(-" + margin.left + ",-" + margin.top + ")");

  x.domain(data.map(function (d) {
    return d.category;
  }));
  y.domain([0, d3.max(data, function (d) {
    return d.value + 1;
  })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("y", 50)
    .attr("x", 400)
    .style("text-anchor", "start")
    .text("Respondent's answer");

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x", -180)
    .style("text-anchor", "end")
    .text("Respondents");

  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("fill", "#4a98d8")
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
    });

  svg.selectAll("text").attr("font-size", "20px");
}

function createPieChart (data) {
  var
    radius = 110,
    width = 570,
    height = 330,
    arc,
    pie,
    arcs,

    color = d3.scale.category20c(),

    vis = d3.select("body")
      .append("svg:svg")
      .data([data])
      .attr("width", width)
      .attr("height", height)
      .append("svg:g")
      .attr("transform", "translate(" + height / 2 + "," + height / 2 + ")");

  vis.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#fff")
    .attr("transform", "translate(-" + height / 2 + ",-" + height / 2 + ")");

  arc = d3.svg.arc()
    .outerRadius(radius);

  pie = d3.layout.pie()
    .value(function (d) {
      return d.value;
    });

  arcs = vis.selectAll("g.slice")
    .data(pie)
    .enter()
    .append("svg:g")
    .attr("class", "slice")
    .attr("stroke", "3px")
    .attr("stroke-width", "#fff");

  arcs.append("svg:path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", "2px")
    .attr("d", arc);

  arcs.append("svg:text")
    .attr("transform", function (d, i) {
      d.innerRadius = 170;
      d.outerRadius = radius;
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function (d, i) {
      return data[i].percents.toFixed(1) + '%';
    });

  d3.select("body svg").append("svg:g")
    .attr("transform", "translate(340, 80)")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    });

  d3.selectAll("g.legend").append("circle")
    .attr("r", 9)
    .style("fill", function (d, i) {
      return color(i);
    });

  d3.selectAll("g.legend").append("text")
    .attr("x", 24)
    .attr("dy", ".35em")
    .text(function (d, i) {
      return data[i].label;
    });
}

exports.getChartImage = function (req, res, next) {
  var
    requestId = req.param('id'),
    owner = req.user.owner,
    svgChart,
    svgXML = '',
    body;

  ChartRequest.findOne({ _id: requestId }).exec(function (err, chartRequest) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    body = chartRequest.body;

    getChartData(body.survey, body.question, body.results, owner, function (err, data, type) {
      if (type === 'int') {
        createBarChart(data);
      }

      if (type === 'select1') {
        createPieChart(data);
      }

      svgChart = d3.selectAll('svg').attr('xmlns', 'http://www.w3.org/2000/svg');

      _.each(svgChart[0], function (svg) {
        svgXML = svgXML + (new xmldom.XMLSerializer()).serializeToString(svg);
      });

      svgXML = svgXML.replace(/<\/?\w+( |>)/g, function (a, b) {
        return String(a).toLowerCase();
      });

      d3.select("svg").remove();

      temp.open({ suffix: '.svg' }, function (err, svgInfo) {
        fs.writeFileSync(svgInfo.path, svgXML);

        temp.open({ suffix: '.png' }, function (err, pngInfo) {
          exec('rsvg-convert ' +  svgInfo.path + ' -o ' + pngInfo.path,
            function (error, stdout, stderr) {
              if (error !== null) {
                console.log('exec error: ' + error);
              }

              res.set("Content-Type", "image/png");
              res.send(fs.readFileSync(pngInfo.path));
              temp.cleanup();
            });
        });
      });
    });
  });
};
