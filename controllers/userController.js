const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// Get user list by fullnames + _id
exports.userlist_get = function(req, res){
  User.find()
  .select('firstName lastName')
  .exec(function(err, userList){
    if(err) return res.status(404).json({err: err});
    if(!userList) return res.status(404).json({err: "could not retrieve user list or users DNE"});
    return res.status(200).json(userList);
  });
};

exports.user_post = [
  // Form validation
  body('firstName', 'First name must not be empty.').trim().isLength({min: 1}).escape(),
  body('lastName', 'Last name must not be empty.').trim().isLength({min: 1}).escape(),
  body('userName', 'Username must not be empty.').trim().isLength({min: 1}).escape(),
  body('password', 'Please enter a strong password of minimum length 8, at least one uppercase and lowercase letter, one number, and one symbol.').trim().isStrongPassword(),
  body('confirmPassword', 'Passwords do not match.').trim().custom((value, { req }) => value === req.body.password),

  (req, res) => {
    const errors = validationResult(req);

    bcryptjs.hash(req.body.password, 10, (err, hashedPassword) => {
      if(err) return res.status(404).json({err: err});
      if(errors) return res.status(404).json({err: errors});
      else {
        const user = new User({
          firstname: req.body.firstName,
          lastname: req.body.lastName,
          username: req.body.userName,
          password: hashedPassword,
        }).save(err => {
          if (err) return res.status(404).json({error: err});
          return res.status(200).json({message: "successfully made user"});
        });
      }
    });
  }
];

// Update to accept filtering:
// See: https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-maintain-good-security-practices
// To implement, maybe create an option string to pass into findById to modify DB call
// See: https://mongoosejs.com/docs/api.html#model_Model.findById
exports.user_get = function(req, res){
  User.findById(req.params.userID)
  .exec(function (err, user){
    if (err) return res.status(404).json({err: err});
    if (!post) return res.status(404).json({err: "could not retive user by ID"});
    return res.status(200).json(user);
  });
};

// Split this into separate name, user, and password update APIs
exports.user_put = [
  // Form validation
  body('firstName', 'First name must not be empty.').trim().isLength({min: 1}).escape(),
  body('lastName', 'Last name must not be empty.').trim().isLength({min: 1}).escape(),
  body('userName', 'Username must not be empty.').trim().isLength({min: 1}).escape(),
  body('password', 'Please enter a strong password of minimum length 8, at least one uppercase and lowercase letter, one number, and one symbol.').trim().isStrongPassword(),
  body('confirmPassword', 'Passwords do not match.').trim().custom((value, { req }) => value === req.body.password),

  (req, res) => {
    const errors = validationResult(req);

    bcryptjs.hash(req.body.password, 10, (err, hashedPassword) => {
      if(err) return res.status(404).json({err: err});
      if(errors) return res.status(404).json({err: errors});

      const user = new User({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        username: req.body.userName,
        password: hashedPassword,
        _id: req.body.userid
      });

      User.findByIdAndUpdate(req.params.userid, user, {}, function(err, updatedUser){
        if (err) return next(err);
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