var
  errorPagePath = 'app/views/getStarted/authError',
  request = require('request'),
  Configuration = require('../../helpers/Configuration'),
  User = require('../../models/User');

function getAccessToken(code, redirectUri, cb) {
  var tokenRequestOptions = {
    method: 'POST',
    url: Configuration.get('OAuth.tokenUrl'),
    form: {
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code,
      client_id: Configuration.get('OAuth.clientId'),
      client_secret: Configuration.get('OAuth.clientSecret')
    }
  };

  request(tokenRequestOptions, function(err, response, body) {
    body = JSON.parse(body);

    if(body.error || !body.access_token) {
      cb(err);
      return;
    }

    cb(null, body.access_token);
  });
}

function getAuthUser(accessToken, cb) {
  var authRequestOptions = {
    method: 'GET',
    url: Configuration.get('OAuth.authUrl'),
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  };

  request(authRequestOptions, function(err, response, body) {
    body = JSON.parse(body);

    if(body.error) {
      cb(err);
      return;
    }

    cb(null, body);
  });
}

exports.auth = function (req, res, next) {
  getAccessToken(req.query.code, req.protocol + '://' + req.get('host') + Configuration.get('OAuth.redirectUrl'), function(err, accessToken) {
    if (err) {
      return res.render(errorPagePath, {
        errorMessage: 'Unhandled Auth Error'
      });
    }

    getAuthUser(accessToken, function(err, authUser) {
      if (err) {
        return res.render(errorPagePath, {
          errorMessage: 'Unhandled Auth Error'
        });
      }

      User
        .findOne({ email: authUser.userPrincipalName, $or: [{ deleted: false }, { deleted: { $exists: false } }] })
        .exec(function (err, user) {
          if (err) {
            return res.render(errorPagePath, {
              errorMessage: 'Unhandled Auth Error'
            });
          }

          if (!user) {
            //redirect to registration;
            var queryString = '';
            queryString += authUser.userPrincipalName ? 'email=' + authUser.userPrincipalName + '&' : '';
            queryString += authUser.givenName ? 'firstName=' + authUser.givenName + '&' : '';
            queryString += authUser.surname ? 'lastName=' + authUser.surname + '&' : '';
            queryString += authUser.mobilePhone ? 'phone=' + authUser.mobilePhone.replace(/[^0-9]/g,'') + '&' : '';

            return res.redirect('/home?' + queryString + '#/register');
          }

          if (user.permission === 'superAdmin' && !user.activated) {
            // redirect to error page 'Your account is not activated yet'
            return res.render(errorPagePath, {
              errorMessage: 'Your account is not activated yet'
            });
          }

          if (user.permission === 'fieldWorker') {
            // redirect to error page 'Access denied for ' + username
            return res.render(errorPagePath, {
              errorMessage: 'Access denied for ' + authUser.userPrincipalName
            });
          }

          req.logIn(user, function (err) {
            if (err) {
              return next(err);
            }

            res.redirect('/#/surveys');
          });
        });
    });
  });
};
