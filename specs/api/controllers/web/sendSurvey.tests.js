var
  APIeasy = require('api-easy'),
  assert = require('assert'),

  surveys = require('../../../../fixtures/Surveys').surveys,
  users = require('../../../../fixtures/Users').users,
  surveyKey,

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),

  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,
  sendSurveySuite = fixturesLoader(APIeasy.describe('Send Survey Controller'));

function sendSurveyTestsForUser (user) {
  surveyKey = 'surveyToSend_' + user;

  loginHelper.login(sendSurveySuite, user)
    .next()
    .discuss('When ' + user)
      .discuss(' tries to send unpublished survey')
        .post('/sendSurvey/' + surveys[surveyKey]._id, { users: [users.superAdmin._id, users.fieldWorker._id] })
        .expect(204)
        .next()
        .get('/surveys/' + surveys[surveyKey]._id)
        .expect('should make this survey published', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.published, true);
        })
        .next()
      .undiscuss()
      .discuss(' tries to send published survey')
        .post('/sendSurvey/' + surveys[surveyKey]._id, { users: [users.admin._id, users.operator._id] })
        .expect(204)
        .next()
      .undiscuss()
      .discuss(' tries to send invalid survey')
        .post('/sendSurvey/' + surveys.surveyFromOtherCommunity._id, { users: [users.admin._id, users.operator._id] })
        .expect(400)
        .expect('should return error message', function (err, resp, body) {
          var result = JSON.parse(body)[0];

          assert.deepEqual(result, { path: 'survey', message: 'Unknown entity' });
        })
        .next()
      .undiscuss()
      .discuss(' tries to send survey to empty user list')
        .post('/sendSurvey/' + surveys[surveyKey]._id, { users: [] })
        .expect(204)
        .next()
      .undiscuss()
    .undiscuss()
}

sendSurveySuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user tries to send survey')
    .post('/sendSurvey/' + surveys.surveyToSend_admin._id)
    .expect(401)
  .undiscuss()
  .next()

sendSurveyTestsForUser('superAdmin');
sendSurveyTestsForUser('admin');
sendSurveyTestsForUser('operator');

sendSurveySuite.export(module);