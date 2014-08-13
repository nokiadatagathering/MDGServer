var
  APIeasy = require('api-easy'),
  _ = require('underscore'),
  moment = require('moment'),
  assert = require('assert'),

  surveys = require('../../../../fixtures/Surveys').surveys,
  users = require('../../../../fixtures/Users').users,
  date = new Date(),
  subscriptionId,
  email = 'test@test.test',

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,

  subscriptionSuite = fixturesLoader(APIeasy.describe('Subscription Controller'));

function subscriptionTestsForUser (user) {
  loginHelper.login(subscriptionSuite, user)
    .next()
    .discuss('When ' + user)
      .path('/surveys/' + surveys.testSurvey._id + '/subscriptions')
      .discuss('tries to create new subscription')
        .post({from: date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(), to: date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(), email: email})
        .expect(200)
        .expect('should respond with new subscription id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id.length, 24);

          subscriptionId = id;

          subscriptionSuite.before('setSubscriptionId', function (outgoing) {
            outgoing.uri = outgoing.uri.replace('SUBSCRIPTION_ID', id);

            return outgoing;
          });
        })
        .next()
      .undiscuss()
      .discuss('tries to get all subscriptions')
        .get()
        .expect(200)
        .expect('should return created subscription on request with _id field', function (err, resp, body) {
          var subscription = JSON.parse(body)[0];

          assert.equal(subscription._id, subscriptionId);
        })
        .expect('should return created subscription on request with email field', function (err, resp, body) {
          var subscription = JSON.parse(body)[0];

          assert.equal(subscription.email, email);
        })
        .expect('should return created subscription on request with from field', function (err, resp, body) {
          var subscription = JSON.parse(body)[0];

          assert.equal(subscription.from, moment(date.toString()).format('DD/MM/YYYY'));
        })
        .expect('should return created subscription on request with to field', function (err, resp, body) {
          var subscription = JSON.parse(body)[0];

          assert.equal(subscription.to, moment(date.toString()).format('DD/MM/YYYY'));
        })
        .next()
      .undiscuss()
      .discuss('tries to delete created subscription')
        .del('/SUBSCRIPTION_ID')
        .expect(204)
        .next()
        .discuss('tries to get subscriptions list')
        .get()
        .expect(200)
        .expect('should return empty list', function (err, resp, body) {
          var subscriptions = JSON.parse(body);

          assert.equal(subscriptions.length, 0);
        })
        .next()
      .undiscuss()
      .unpath()
    .undiscuss()
}

subscriptionSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user tries to create subscription')
    .post('/surveys/' + surveys.testSurvey._id + '/subscriptions', {})
    .expect(401)
  .undiscuss()
  .discuss('When unauthorized user tries to get all subscriptions')
    .get('/surveys/' + surveys.testSurvey._id + '/subscriptions')
    .expect(401)
  .undiscuss()
  .discuss('When unauthorized user tries to delete subscription')
    .del('/surveys/' + surveys.testSurvey._id + '/subscriptions/SUBSCRIPTION_ID')
    .expect(401)
  .undiscuss()
  .next()

loginHelper.login(subscriptionSuite, 'operator')
  .next()

subscriptionTestsForUser('superAdmin');
subscriptionTestsForUser('admin');
subscriptionTestsForUser('operator');

subscriptionSuite.export(module);
