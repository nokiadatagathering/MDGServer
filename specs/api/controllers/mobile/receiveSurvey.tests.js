var
  APIeasy = require('api-easy'),
  assert = require('assert'),
  crypto = require('crypto'),

  users = require('../../../../fixtures/Users').users,

  Configuration = require('../../../../app/helpers/Configuration'),
  JXON = require('../../../../app/helpers/JXON'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,

  receiveSurveySuite = fixturesLoader(APIeasy.describe('Receive Survey Controller'));

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

function receiveSurveyTestsForUser (user) {
  receiveSurveySuite
    .discuss('When ' + user)
      .setHeader('Authorization', getDigestAuthHeader(user, 'GET', '/ReceiveSurvey'))
      .discuss('tries to receive surveys list')
        .get('/ReceiveSurvey')
        .expect(200)
        .expect('should return xml file with one survey id and download url', function (err, resp, body) {
          JXON.readString(body, JXON.WITHOUT_VALIDATION, function (err, response) {
            assert.equal(response.tagName, 'xforms');
            assert.equal(response.items.length, 1);

            assert.include(response.items[0].items[0].tagName, 'formid');
            assert.include(response.items[0].items[1].tagName, 'name');
            assert.include(response.items[0].items[2].tagName, 'majorminorversion');
            assert.include(response.items[0].items[3].tagName, 'downloadurl');

            receiveSurveySuite.before('setDownloadUrl', function (outgoing) {
              if (/setDownloadUrl/.test(outgoing.uri)) {
                outgoing.uri =  response.items[0].items[3].value;
                outgoing.headers.Authorization = getDigestAuthHeader(user, 'GET', outgoing.uri.split(':' + Configuration.get('tests.port'))[1]);
              }

              return outgoing;
            });
          });
        })
        .next()
      .undiscuss()
      .discuss('tries to get survey by download url')
        .get('/setDownloadUrl')
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
      .discuss('tries to receive survey second time')
        .get('/ReceiveSurvey')
        .expect(200)
        .expect('should return xml file without surveys', function (err, resp, body) {
          JXON.readString(body, JXON.WITHOUT_VALIDATION, function (err, response) {
            assert.equal(response.tagName, 'xforms');
            assert.equal(response.items.length, 0);
          });
        })
        .next()
      .undiscuss()
    .undiscuss()
}

receiveSurveySuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user tries to receive survey')
    .get('/ReceiveSurvey')
    .expect('should respond with www-authenticate header with digest params', function (err, resp, body) {
      assert.include(resp.headers, "www-authenticate");
      assert.equal(resp.headers["www-authenticate"].split(' ')[0], 'Digest');
    })
    .next()
  .undiscuss()

receiveSurveyTestsForUser('superAdmin');
receiveSurveyTestsForUser('admin');
receiveSurveyTestsForUser('operator');
receiveSurveyTestsForUser('fieldWorker');

receiveSurveySuite.export(module);