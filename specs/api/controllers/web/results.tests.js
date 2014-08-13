var
  APIeasy = require('api-easy'),
  assert = require('assert'),

  surveys = require('../../../../fixtures/Surveys').surveys,
  resultsLength = 5;

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),

  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,
  resultsSuite = fixturesLoader(APIeasy.describe('Results Controller'));

function resultsTestsForUser (user) {
  loginHelper.login(resultsSuite, user)
    .next()
    .discuss('When ' + user)
      .path('/surveys/' + surveys.testSurvey._id + '/results')
      .discuss('tries to get results list')
        .get()
        .expect(200)
        .expect('should respond with results list', function (err, resp, body) {
          var
            response = JSON.parse(body),
            id = response[response.length - 1]._id.toString();

          assert.equal(response.length, resultsLength);

          resultsSuite.before('setResultId', function (outgoing) {
            outgoing.uri = outgoing.uri.replace('RESULT_ID', id);

            return outgoing;
          });
        })
        .next()
      .undiscuss()
      .discuss('tries to get one result')
        .get('/RESULT_ID')
        .expect(200)
        .expect('should return this result on show request with _id field', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.include(result, "_id");
        })
        .expect('should return this result on show request with title field', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.include(result, "title");
        })
        .expect('should return this result on show request with timeCreated field', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.include(result, "timeCreated");
        })
        .expect('should return this result on show request with _user field', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.include(result, '_user');
          assert.include(result._user, 'firstName');
          assert.include(result._user, 'lastName');
        })
        .expect('should return this result on show request with _categoryResults field', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.include(result, '_categoryResults');
          assert.include(result._categoryResults[0], 'title');
          assert.include(result._categoryResults[0], 'id');
        })
        .expect('should return this result on show request with _questionResults field', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.include(result._categoryResults[0], '_questionResults');
          assert.include(result._categoryResults[0]._questionResults[0], 'label');
          assert.include(result._categoryResults[0]._questionResults[0], 'id');
          assert.include(result._categoryResults[1], '_questionResults');
          assert.include(result._categoryResults[1]._questionResults[0], 'label');
          assert.include(result._categoryResults[1]._questionResults[0], 'id');
          assert.include(result._categoryResults[1]._questionResults[0], 'result');
        })
       .next()
      .undiscuss()
      .discuss('tries to delete result')
        .del('/RESULT_ID')
        .expect(204)
        .next()
        .discuss('and requests this survey')
          .get('/RESULT_ID')
          .expect(400)
          .expect('should return error message', function (err, resp, body) {
            var result = JSON.parse(body)[0];

            assert.deepEqual(result, { path: 'result', message: 'Unknown entity' });

            resultsLength = resultsLength - 1;
          })
        .undiscuss()
        .next()
      .undiscuss()
      .unpath()
      .discuss('tries to get result for the survey from other community')
        .get('/surveys/' + surveys.surveyFromOtherCommunity._id + '/results/RESULT_ID')
        .expect(400)
        .expect('should return error message', function (err, resp, body) {
          var result = JSON.parse(body)[0];

          assert.deepEqual(result, { path: 'survey', message: 'Unknown entity' });
        })
        .next()
      .undiscuss()
    .undiscuss()
}

resultsSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user')
    .path('/surveys/' + surveys.testSurvey._id + '/results')
    .discuss('tries to get results list')
      .get()
      .expect(401)
      .undiscuss()
      .next()
    .discuss('tries to get results info')
      .get('/someresultid')
      .expect(401)
      .undiscuss()
      .next()
    .discuss('tries to delete results info')
      .del('/someresultid')
      .expect(401)
      .undiscuss()
      .next()
  .undiscuss()
  .unpath()

resultsTestsForUser('superAdmin');
resultsTestsForUser('admin');
resultsTestsForUser('operator');

resultsSuite.export(module);
