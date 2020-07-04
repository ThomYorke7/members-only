require('dotenv').config();
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated } = require('../config/auth.js');

// Login Handle
router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

// Register Handle
router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  const { firstname, lastname, username, password, password2 } = req.body;
  let errors = [];

  if (!firstname || !lastname || !username || !password || !password2) {
    errors.push({ msg: 'Please fill in all the fields' });
  }

  if (firstname.length < 2 || lastname.length < 2) {
    errors.push({
      msg: 'First name and last name must contain at least 2 characters',
    });
  }

  if (username.length < 3) {
    errors.push({ msg: 'Username must be at least 3 characters' });
  }

  if (password.length < 6 || password2.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      firstname,
      lastname,
      username,
      password,
      password2,
    });
  } else {
    // Check if user exists
    User.findOne({ username: username }).then((user) => {
      if (user) {
        errors.push({ msg: 'Username is already registered' });
        res.render('register', {
          errors,
          firstname,
          lastname,
          username,
          password,
          password2,
        });
      } else {
        // Create new User
        const newUser = new User({
          firstname: firstname,
          lastname: lastname,
          username: username,
          password: password,
          member: true,
          admin: false,
        });

        // Encrypt Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            // Save User in Database
            newUser
              .save()
              .then((user) => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in.'
                );
                res.redirect('/users/login');
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Become an Admin
router.get('/admin', ensureAuthenticated, (req, res) => {
  res.render('admin');
});

router.post('/admin', (req, res, next) => {
  const { adminPassword } = req.body;
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    const updatedUser = {
      admin: true,
    };
    User.findByIdAndUpdate(req.user.id, updatedUser).then((updated) => {
      res.redirect('/');
    });
  } else {
    req.flash('error_msg', 'Incorrect Secret Password');
    res.redirect('/users/admin');
  }
});

module.exports = router;
