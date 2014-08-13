var
  APIeasy = require('api-easy'),
  assert = require('assert'),
  crypto = require('crypto'),

  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite;
  users = require('../../../../fixtures/Users').users,

  Configuration = require('../../../../app/helpers/Configuration'),
  checkAuthorizationSuite = fixturesLoader(APIeasy.describe('Check Authorization Controller'));

function getDigestAuthHeader (user, method, uri) {
  var
    nonce = '13909893236171a6f7d0a',
    cnonce = '9eb9096fdfd878e4906b0f912a1e20f6',
    nc = '00000005',
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

checkAuthorizationSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'multipart/form-data')
  .discuss('When user with invalid username tries check authorization')
    .setHeader('Authorization', getDigestAuthHeader({username: 'FakeUserName', password: 'FakePassword'}, 'GET', '/checkAuthorization'))
    .get('/checkAuthorization')
    .expect(401)
    .expect('should respond with www-authenticate header with digest params', function (err, resp, body) {
      assert.include(resp.headers, "www-authenticate");
      assert.equal(resp.headers["www-authenticate"].split(' ')[0], 'Digest');
    })
    .next()
  .undiscuss()
  .discuss('When user tries check authorization with invalid password')
    .setHeader('Authorization', getDigestAuthHeader({username: 'Stanley', password: 'FakePassword'}, 'GET', '/checkAuthorization'))
    .get('/checkAuthorization')
    .expect(401)
    .expect('should respond with www-authenticate header with digest params', function (err, resp, body) {
      assert.include(resp.headers, "www-authenticate");
      assert.equal(resp.headers["www-authenticate"].split(' ')[0], 'Digest');
    })
    .next()
  .undiscuss()
  .discuss('When superAdmin tries check authorization')
    .setHeader('Authorization', getDigestAuthHeader(users.superAdmin, 'GET', '/checkAuthorization'))
    .get('/checkAuthorization')
    .expect(200)
    .next()
  .undiscuss()
  .discuss('When admin tries check authorization')
    .setHeader('Authorization', getDigestAuthHeader(users.admin, 'GET', '/checkAuthorization'))
    .get('/checkAuthorization')
    .expect(200)
    .next()
  .undiscuss()
  .discuss('When operator tries check authorization')
    .setHeader('Authorization', getDigestAuthHeader(users.operator, 'GET', '/checkAuthorization'))
    .get('/checkAuthorization')
    .expect(200)
    .next()
  .undiscuss()
  .discuss('When fieldWorker tries check authorization')
    .setHeader('Authorization', getDigestAuthHeader(users.fieldWorker, 'GET', '/checkAuthorization'))
    .get('/checkAuthorization')
    .expect(200)
    .next()
  .undiscuss()
  .export(module);
