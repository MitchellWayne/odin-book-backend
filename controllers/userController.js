const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.userlist_get = function(req, res, next){
  User.find()
  .exec(function(err, userList){
    if(err) return next(err);
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

  // (req, res, next) => {
  //   const errors = validationResult(req);

  //   bcryptjs.hash(req.body.password, 10, (err, hashedPassword) => {
  //     if (err) return next(err);
  //     else {
  //       const user = new User({
  //         username: req.body.username,
  //         password: hashedPassword,
  //       }).save(err => {
  //         if (err) return res.status(404).json({error: err});
  //         return res.status(200).json({message: "successfully made user"});
  //       });
  //     }
  //   });
  // }
];

exports.user_get = function(req, res, next){
  User.findById(req.params.userID)
  .exec(function (err, user){
    if (err) return next(err);
    if (!post) return res.status(404).json({err: "could not retive user by ID"});
    return res.status(200).json(user);
  });
};

exports.user_put = function(req, res){

};

exports.user_delete = function(req, res){

};

// Maybe seperate functions to get user posts, fullname, friends, and requests.