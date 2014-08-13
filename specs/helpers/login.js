var userFixtures = require('../../fixtures/Users');

exports.login = function (suite, userKey) {
  suite
    .post('/login', {username: userFixtures.users[userKey].username, password: new Buffer(userFixtures.users[userKey]._password).toString('base64')})
    .expect(200)
    .expect('login as ' + userKey, function (err, res) {
      var loginCookie;

      res.headers['set-cookie'].forEach(function (cookie) {
        if (!!~cookie.indexOf('connect.sid')) {
          loginCookie = cookie.split(';', 1)[0];
        }
      });

      suite.before('login as ' + userKey, function (outgoing) {
        if(!/login$/.test(outgoing.uri)) {
          outgoing.headers['Cookie'] = loginCookie + ';';
        }
        return outgoing;
      })
    });

  return suite;
}
