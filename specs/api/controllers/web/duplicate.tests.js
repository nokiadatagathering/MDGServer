var
  APIeasy = require('api-easy'),
  _ = require('underscore'),
  assert = require('assert'),

  surveys = require('../../../../fixtures/Surveys').surveys,
  users = require('../../../../fixtures/Users').users,
  newSurveyId,

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,

  duplicateSuite = fixturesLoader(APIeasy.describe('Duplicate Controller'));

function duplicateTestsForUser (user) {
  loginHelper.login(duplicateSuite, user)
    .next()
    .discuss('When ' + user)
      .discuss(' tries to duplicate unpublished survey')
        .post('/duplicate/' + surveys.unpublishedSurvey._id)
        .expect(200)
        .expect('should respond with new survey id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id.length, 24);

          duplicateSuite.before('setSurveyId', function (outgoing) {
            outgoing.uri = outgoing.uri.replace('SURVEY_ID', id);
            newSurveyId = id;

            return outgoing;
          });
        })
        .next()
        .get('/surveys/SURVEY_ID')
        .expect(200)
        .expect('should return this survey on show request with _id field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._id, newSurveyId);
        })
        .expect('should return this survey on show request with title field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.title, surveys.unpublishedSurvey.title);
        })
        .expect('should return this survey on show request with _owner field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._owner, surveys.unpublishedSurvey._owner.toString());
        })
        .expect('should return this survey on show request with _creator field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._creator._id, users[user]._id.toString());
          assert.equal(survey._creator.firstName, users[user].firstName);
          assert.equal(survey._creator.lastName, users[user].lastName);
        })
        .expect('should return this survey on show request with _categories field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._categories.length, surveys.unpublishedSurvey._categories.length);
        })
        .expect('should return this survey on show request with published field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.published, false);
        })
        .expect('should return this survey on show request with _v field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.__v, 0);
        })
        .next()
        .undiscuss()
      .discuss(' tries to duplicate published survey')
        .post('/duplicate/' + surveys.publishedSurvey._id)
        .expect(200)
        .expect('should respond with new survey id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id.length, 24);

          duplicateSuite.before('setSurveyId', function (outgoing) {
            outgoing.uri = outgoing.uri.replace('SURVEY_ID', id);

            newSurveyId = id;

            return outgoing;
          });
        })
        .next()
        .get('/surveys/SURVEY_ID')
        .expect(200)
        .expect('should return this survey on show request with id field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._id, newSurveyId);
        })
        .expect('should return this survey on show request with title field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.title, surveys.publishedSurvey.title);
        })
        .expect('should return this survey on show request with _owner field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._owner, surveys.publishedSurvey._owner.toString());
        })
        .expect('should return this survey on show request with _creator field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._creator._id, users[user]._id.toString());
          assert.equal(survey._creator.firstName, users[user].firstName);
          assert.equal(survey._creator.lastName, users[user].lastName);
        })
        .expect('should return this survey on show request with _categories field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._categories.length, surveys.publishedSurvey._categories.length);
        })
        .expect('should return this survey on show request with published field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.published, false);
        })
        .expect('should return this survey on show request with _v field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.__v, 0);
        })
        .next()
        .undiscuss()
      .undiscuss()
  }

duplicateSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user tries to duplicate survey')
    .post('/duplicate/' + surveys.publishedSurvey._id)
    .expect(401)
    .undiscuss()
    .next()

duplicateTestsForUser('superAdmin');
duplicateTestsForUser('admin');
duplicateTestsForUser('operator');

duplicateSuite.export(module);