var
  APIeasy = require('api-easy'),
  assert = require('assert'),
  crypto = require('crypto'),

  users = require('../../../../fixtures/Users').users,
  surveys = require('../../../../fixtures/Surveys').surveys,

  testXMLPath = '../../../../resources/xml/results.xml',
  path = require('path'),

  Configuration = require('../../../../app/helpers/Configuration'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,

  postResultsSuite = fixturesLoader(APIeasy.describe('Post Results Controller'));

function getDigestAuthHeader (userKey, method, uri) {
  var
    nonce = '13909893236171a6f7d0a',
    cnonce = '9eb9096fdfd878e4906b0f912a1e20f6',
    nc = '00000005',
    user = users[userKey],
    a1Md5 = crypto.createHash('md5').update(user.username + ":" + Configuration.get('digestAuth.realm') + ":" + user._password).digest("hex"),
    a2Md5 = crypto.createHash('md5').update(method + ":" + uri).digest("hex"),
    response = crypto.createHash('md5').update(a1Md5 + ":" + nonce + ":" + nc + ":" + cnonce + ":" + Configuration.get('digestAuth.qop') + ":" + a2Md5).digest("hex");

    return 'Digest username="' + user.username +
        '",realm="' + Configuration.get('digestAuth.realm') +
        '",nonce="' + nonce +
        '",uri="' + uri +
        '",cnonce="' + cnonce +
        '",nc=' + nc + '' +
        ',response="' + response +
        '",qop="' + Configuration.get('digestAuth.qop') +
        '",opaque="' + Configuration.get('digestAuth.opaque') + '"';
}

function postResultsTestsForUser (user) {
  postResultsSuite
    .discuss('When ' + user)
      .setHeader('Authorization', getDigestAuthHeader(user, 'POST', '/PostResults'))
      .discuss('post xml results')
        .uploadFile('/PostResults', path.resolve(__dirname + testXMLPath), 'filename', { surveyId: surveys.testSurvey._id.toString() })
        .expect(200)
        .expect('should return result id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id.length, 24);
        })
        .next()
      .undiscuss()
      .discuss('tries to post results for unpublished survey')
        .uploadFile('/PostResults', path.resolve(__dirname + testXMLPath), 'filename', { surveyId: surveys.unpublishedSurvey._id.toString() })
        .expect(400, [{ path: 'survey', message: 'Can not post results for unpublished survey' }])
        .next()
      .undiscuss()
      .discuss('tries to post results without xml file')
        .setHeader('Content-Type', 'application/json')
        .post('/PostResults', { surveyId: surveys.testSurvey._id.toString() })
        .expect(400, [{ path: 'filename', message: 'This field is required' }])
        .next()
      .undiscuss()
      .discuss('tries to post results with invalid survey id')
        .setHeader('Content-Type', 'multipart/form-data')
        .uploadFile('/PostResults', path.resolve(__dirname + testXMLPath), 'filename', { surveyId: users.admin._id.toString() })
        .expect(400, [{ path: 'survey', message: 'Unknown entity' }])
        .next()
      .undiscuss()
      .discuss('tries to post results for the survey from other community')
        .uploadFile('/PostResults', path.resolve(__dirname + testXMLPath), 'filename', { surveyId: surveys.surveyFromOtherCommunity._id.toString() })
        .expect(400, [{ path: 'survey', message: 'Unknown entity' }])
        .next()
      .undiscuss()
      .discuss('post xml results for the same survey at the second time')
        .uploadFile('/PostResults', path.resolve(__dirname + testXMLPath), 'filename', { surveyId: surveys.testSurvey._id.toString() })
        .expect(200)
        .expect('should return result id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id.length, 24);
        })
        .next()
      .undiscuss()
    .undiscuss()
}

postResultsSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'multipart/form-data')
  .discuss('When unauthorized user tries to post results')
    .uploadFile('/PostResults', path.resolve(__dirname + testXMLPath), 'filename', { surveyId: surveys.testSurvey._id.toString() })
    .expect('should respond with www-authenticate header with digest params', function (err, resp, body) {
      assert.include(resp.headers, "www-authenticate");
      assert.equal(resp.headers["www-authenticate"].split(' ')[0], 'Digest');
    })
    .next()
  .undiscuss()

postResultsTestsForUser('superAdmin');
postResultsTestsForUser('admin');
postResultsTestsForUser('operator');
postResultsTestsForUser('fieldWorker');

postResultsSuite.export(module);