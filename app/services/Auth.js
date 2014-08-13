var
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  DigestStrategy = require('passport-http').DigestStrategy,

  Configuration = require('../helpers/Configuration'),
  User = require('../models/User');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function (username, password, done) {
  User
    .findOne({ username: username })
    .exec(function (err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Unknown username or invalid password' });
      }

      if (user.permission === 'superAdmin' && !user.activated) {
        return done(null, false, { message: 'Your account is not activated yet' });
      }

      if (user.permission === 'fieldWorker') {
        return done(null, false, { message: 'Access denied for ' + username });
      }

      user.checkPassword(password, function (err, res) {
        if (res) {
          return done(null, user);
        }

        return done(null, false, { message: 'Unknown username or invalid password' });
      });
    });
}));

passport.use(new DigestStrategy(Configuration.get('digestAuth'),
  function (username, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Unknown user ' + username });
      }

      return done(null, user, { ha1: user.password });
    });
  }
));
