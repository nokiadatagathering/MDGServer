var
  APIeasy = require('api-easy'),
  _ = require('underscore'),
  assert = require('assert'),

  results = require('../../../../fixtures/Results').results,
  surveys = require('../../../../fixtures/Surveys').surveys,

  resultsIds = [results.result1._id, results.result2._id, results.result3._id, results.result4._id, results.result5._id],

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,

  chartSuite = fixturesLoader(APIeasy.describe('Chart Data Controller'));

function chartDataTestsForUser (user) {
  loginHelper.login(chartSuite, user)
    .next()
    .discuss('When ' + user)
      .path('/chartData')
      .discuss('tries to get data for bar chart')
        .post({
          survey: surveys.testSurvey._id,
          question: 'question6352',
          results: resultsIds
        })
        .expect(200)
        .expect('should respond with data object', function (err, resp, body) {
          var results = JSON.parse(body);

          _.map(results, function (result) {
            assert.include(result, 'value');
            assert.include(result, 'category');
          })
        })
        .next()
      .undiscuss()
      .discuss('tries to get data for pie chart')
        .post({
          survey: surveys.testSurvey._id,
          question: 'question7535',
          results: resultsIds
        })
        .expect(200)
        .expect('should respond with data object', function (err, resp, body) {
          var results = JSON.parse(body);

          _.map(results, function (result) {
            assert.include(result, 'value');
            assert.include(result, 'percents');
            assert.include(result, 'label');
          })
        })
        .next()
      .undiscuss()
      .discuss('tries to get data for geolocation chart')
        .post({
          survey: surveys.testSurvey._id,
          results: resultsIds
        })
        .expect(200)
        .expect('should respond with data object', function (err, resp, body) {
          var results = JSON.parse(body);

          assert.equal(results.length, 5);

          _.map(results, function (result) {
            assert.include(result, 'user');
            assert.include(result, 'latitude');
            assert.include(result, 'longitude');
            assert.include(result, 'title');
            assert.include(result, 'id');
          })
        })
        .next()
      .undiscuss()
      .discuss('tries to get chart data with invalid survey id')
        .post({
          survey:  surveys.surveyFromOtherCommunity._id,
          results: resultsIds
        })
        .expect(400)
        .expect('should return error message', function (err, resp, body) {
          var result = JSON.parse(body)[0];

          assert.deepEqual(result, { path: 'survey', message: 'Unknown entity' });
        })
        .next()
      .undiscuss()
      .discuss('tries to get chart data with invalid question id')
        .post({
          survey: surveys.testSurvey._id,
          question: "question1111",
          results: resultsIds
        })
        .expect(400)
        .expect('should return error message', function (err, resp, body) {
          var result = JSON.parse(body)[0];

          assert.deepEqual(result, { path: 'questionID', message: 'Unknown entity' });
        })
        .next()
      .undiscuss()
      .unpath()
      .discuss('tries to get url for bar chart')
        .post('/chartUrl', {
          survey: surveys.testSurvey._id,
          question: 'question6352',
          results: resultsIds
        })
        .expect(200)
        .expect('should respond with url', function (err, resp, body) {
          var response = JSON.parse(body);

          assert.include(response, 'imageUrl');

          chartSuite.before('ImageUrl', function (outgoing) {
            outgoing.uri = outgoing.uri = response.imageUrl;

            return outgoing;
          });
        })
        .next()
      .undiscuss()
      .discuss('tries to get bar chart image')
        .get('IMAGE_URL')
        .expect(200)
        .expect('should respond with image', function (err, resp, body) {
          assert.include(resp.headers, "content-type");
          assert.equal(resp.headers["content-type"], 'image/png');

          chartSuite.unbefore('ImageUrl');
        })
        .next()
      .undiscuss()
      .discuss('tries to get url for pie chart')
        .post('/chartUrl', {
          survey: surveys.testSurvey._id,
          question: 'question7535',
          results: resultsIds
        })
        .expect(200)
        .expect('should respond with url', function (err, resp, body) {
          var response = JSON.parse(body);

          assert.include(response, 'imageUrl');

          chartSuite.before('ImageUrl', function (outgoing) {
            outgoing.uri = outgoing.uri = response.imageUrl;

            return outgoing;
          });
        })
        .next()
      .undiscuss()
      .discuss('tries to get pie chart image')
        .get('IMAGE_URL')
        .expect(200)
        .expect('should respond with image', function (err, resp, body) {
          assert.include(resp.headers, "content-type");
          assert.equal(resp.headers["content-type"], 'image/png');

          chartSuite.unbefore('ImageUrl');
        })
        .next()
      .undiscuss()

  resultsIds.push(results.resultFromOtherCommunity._id);

  chartSuite
      .discuss('tries to get chart data with invalid result id in results list')
        .post('/chartData', {
          survey: surveys.testSurvey._id,
          results: resultsIds
        })
        .expect(200)
        .expect('should return only 5 results', function (err, resp, body) {
          var results = JSON.parse(body);

          assert.equal(results.length, 5);
        })
        .next()
      .undiscuss()
    .undiscuss()
    .unpath()
}

chartSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user tries to get chart data')
    .post('/chartData')
    .expect(401)
  .undiscuss()

chartDataTestsForUser('superAdmin');
chartDataTestsForUser('admin');
chartDataTestsForUser('operator');

chartSuite.export(module);

