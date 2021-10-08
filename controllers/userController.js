const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// Get user list by fullnames + _id
exports.userlist_get = function(req, res){
  const { firstname, lastname } = req.query;
  User.find()
  .select('firstname lastname username')
  .exec(function(err, userList){
    if(err) return res.status(404).json({err: err});
    if(!userList) return res.status(404).json({err: "could not retrieve user list or users DNE"});

    if(firstname) userList = userList.filter(x => x.firstname === firstname);
    if(lastname) userList = userList.filter(x => x.lastname === lastname);

    return res.status(200).json(userList);
  });
};

// Need to check to make sure username doesn't already exist!
exports.user_post = [
  // Form validation
  body('firstname', 'First name must not be empty.').trim().isLength({min: 1}).escape(),
  body('lastname', 'Last name must not be empty.').trim().isLength({min: 1}).escape(),
  body('username', 'Username must not be empty.').trim().isLength({min: 1}).escape(),
  body('password', 'Please enter a strong password of minimum length 8, at least one uppercase and lowercase letter, one number, and one symbol.').trim().isStrongPassword(),

  (req, res) => {
    const errors = validationResult(req);

    bcryptjs.hash(req.body.password, 10, (err, hashedPassword) => {
      if(err) return res.status(404).json({err: err});
      if(!errors.isEmpty()) return res.status(404).json({err: errors});
      else {
        const user = new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username,
          password: hashedPassword,
        }).save(saveErr => {
          if (saveErr) return res.status(404).json({err: saveErr});
          return res.status(200).json({message: "successfully made user"});
        });
      }
    });
  }
];

exports.user_get = function(req, res){
  User.findById(req.params.userID)
  .exec(function (err, user){
    if (err) return res.status(404).json({err: err});
    if (!user) return res.status(404).json({err: "could not retive user by ID"});
    return res.status(200).json(user);
  });
};

// Split this into separate name, user, and password update APIs
exports.user_put = [
  // Form validation
  body('firstname', 'First name must not be empty.').trim().isLength({min: 1}).escape(),
  body('lastname', 'Last name must not be empty.').trim().isLength({min: 1}).escape(),
  body('username', 'Username must not be empty.').trim().isLength({min: 1}).escape(),
  body('password', 'Please enter a strong password of minimum length 8, at least one uppercase and lowercase letter, one number, and one symbol.').trim().isStrongPassword(),
  body('confirmPassword', 'Passwords do not match.').trim().custom((value, { req }) => value === req.body.password),

  (req, res) => {
    const errors = validationResult(req);

    bcryptjs.hash(req.body.password, 10, (err, hashedPassword) => {
      if(err) return res.status(404).json({err: err});
      if(!errors.isEmpty()) return res.status(404).json({err: errors});

      const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: hashedPassword,
        _id: req.body.userid
      });

      User.findByIdAndUpdate(req.params.userid, user, {}, function(updateErr, updatedUser){
        if (updateErr) return next(updateErr);
        return res.status(200).json({message: "user updated successfully"});
      });
    });
  }
];

exports.user_delete = function(req, res){

};

// Add user_login and user_logout

// Instead of a userfriend_post, update the friend field through the request API
// let the request API take the target user ID and a boolean to determine whether to
// add the target user to the current user's friendlist