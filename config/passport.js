const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }).then((user) => {
        if (!user) {
          return done(null, false, { message: 'Incorrect Username' });
        }
        // Match Password
        bcrypt.compare(password, user.password, (err, res) => {
          if (err) {
            throw err;
          }
          if (res) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect Password' });
          }
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
