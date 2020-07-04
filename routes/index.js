var express = require('express');
var router = express.Router();
var Message = require('../models/message');
var moment = require('moment');

/* GET home page. */
router.get('/', function (req, res, next) {
  Message.find()
    .populate('user')
    .then((messages) => {
      res.render('index', { title: 'Home', messages });
    });
});

// Create and save a new message
router.post('/message', (req, res, next) => {
  const { title, text } = req.body;
  const newMessage = new Message({
    title,
    text,
    timestamp: moment().format('MMMM Do YYYY [at] HH:mm:ss'),
    user: req.user._id,
  });
  newMessage.save(function (err) {
    if (err) {
      return console.error(err);
    }
    req.user.messages.push(newMessage);
    req.user.save(function (err) {
      if (err) {
        return console.error(err);
      }
    });
    res.redirect('/');
  });
});

// Delete message
router.post('/message/delete/:id', (req, res, next) => {
  Message.findByIdAndDelete(req.params.id)
    .then((message) => res.redirect('/'))
    .catch((err) => console.log(err));
});

module.exports = router;
