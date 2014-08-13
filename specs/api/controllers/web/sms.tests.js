var
  APIeasy = require('api-easy'),
  assert = require('assert'),
  sms = 'Sms text',

  users = require('../../../../fixtures/Users').users,
  groups = require('../../../../fixtures/Groups').groups,

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,
  smsSuite = fixturesLoader(APIeasy.describe('Sms Controller'));

smsSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json');

loginHelper.login(smsSuite, 'superAdmin')
  .next()
  .discuss('When superAdmin')
    .path('/sms')
    .discuss('sends sms to user')
      .post('user/' + users.operator._id, {sms: sms})
      .expect(204)
      .next()
      .undiscuss()
    .discuss('sends sms to group')
      .post('group/' + groups.testGroup._id, {sms: sms})
      .expect(204)
      .next()
      .undiscuss()
    .discuss('sends sms with invalid path')
      .post('invalidType/' + groups.testGroup._id, {sms: sms})
      .expect(400)
      .next()
      .undiscuss()
    .unpath()
    .undiscuss()

loginHelper.login(smsSuite, 'admin')
  .next()
  .discuss('When admin')
    .path('/sms')
    .discuss('sends sms to user')
      .post('user/' + users.fieldWorker._id, {sms: sms})
      .expect(204)
      .next()
      .undiscuss()
    .discuss('sends sms to group')
      .post('group/' + groups.testGroup._id, {sms: sms})
      .expect(204)
      .next()
      .undiscuss()
    .discuss('sends sms with invalid path')
      .post('invalidType/' + groups.testGroup._id, {sms: sms})
      .expect(400)
      .next()
      .undiscuss()
   .unpath()
   .undiscuss()

loginHelper.login(smsSuite, 'operator')
  .next()
  .discuss('When operator')
    .path('/sms')
    .discuss('sends sms to user')
      .post('user/' + users.fieldWorker._id, {sms: sms})
      .expect(403)
      .next()
      .undiscuss()
    .discuss('sends sms to group')
      .post('group/' + groups.testGroup._id, {sms: sms})
      .expect(403)
      .next()
      .undiscuss()
   .undiscuss()
  .export(module);

