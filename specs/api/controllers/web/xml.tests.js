var
  APIeasy = require('api-easy'),
  assert = require('assert'),
  fs = require('fs'),
  path = require('path'),

  users = require('../../../../fixtures/Users').users,
  surveys = require('../../../../fixtures/Surveys').surveys,

  loginHelper = require('../../../helpers/login'),

  Configuration = require('../../../../app/helpers/Configuration'),
  JXON = require('../../../../app/helpers/JXON'),

  testXMLPath = '../../../../resources/xml/survey.xml',
  testXML = fs.readFileSync(path.resolve(__dirname + testXMLPath), 'utf8'),

  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,
  xmlSuite = fixturesLoader(APIeasy.describe('XML Controller'));

function xmlTestsForUser (user) {
  loginHelper.login(xmlSuite, user)
    .next()
    .discuss('When ' + user)
      .discuss('tries to post survey as xml')
        .post('/xml', { xml: testXML })
        .expect(200)
        .expect('should respond with new survey id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id.length, 24);

          xmlSuite.before('setSurveyId', function (outgoing) {
            outgoing.uri = outgoing.uri.replace('SURVEY_ID', id);

            return outgoing;
          });
        })
        .next()
      .undiscuss()
      .discuss('tries to download xml with survey')
        .get('xml/SURVEY_ID')
        .expect(200)
        .expect('should return xml file with survey info', function (err, resp, body) {
          JXON.readString(body, JXON.WITH_VALIDATION, function (err, response) {
            assert.include(response.tagName, 'h:html');
            assert.include(response.items[0].tagName, 'h:head');
            assert.include(response.items[1].tagName, 'h:body');
            assert.include(response.items[0].items[0].tagName, 'h:title');
            assert.include(response.items[0].items[1].tagName, 'model');
          });
        })
        .next()
      .undiscuss()
      .discuss('tries to post survey as xml without attached file')
        .post('/xml', {})
        .expect(400)
        .expect('should return error message', function (err, resp, body) {
          var result = JSON.parse(body)[0];

          assert.deepEqual(result, { path: 'xml file', message: 'This field is required' });
        })
        .next()
      .undiscuss()
    .undiscuss()
}

xmlSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user')
    .discuss('tries to post xml')
      .post('/xml', { xml: '<? xml version="1.0" ?><a>Test1</a>' })
      .expect(401)
      .next()
    .undiscuss()
    .discuss('tries to get xml')
      .get('xml/' + surveys.testSurvey)
      .expect(401)
      .next()
    .undiscuss()
  .undiscuss()

xmlTestsForUser('superAdmin');
xmlTestsForUser('admin');
xmlTestsForUser('operator');

xmlSuite.export(module);
