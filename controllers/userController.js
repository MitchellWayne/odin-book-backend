const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

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

exports.user_post = [
  // Form validation
  body('firstname', 'First name must not be empty.').trim().isLength({min: 1}).escape(),
  body('lastname', 'Last name must not be empty.').trim().isLength({min: 1}).escape(),
  body('username', 'Username must not be empty.').trim().isLength({min: 1}).escape(),
  body('password', 'Please enter a strong password of minimum length 8, at least one uppercase and lowercase letter, one number, and one symbol.').trim().isStrongPassword(),

  (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(404).json({err: errors});

    User.findOne({ username: req.body.username})
    .exec(function(findErr, userExists){
      if(findErr) return res.status(404).json({err: findErr});
      if(userExists) return res.status(406).json({err: "username already taken"});
        bcryptjs.hash(req.body.password, 10, (err, hashedPassword) => {
          if(err) return res.status(404).json({err: err});
          else {
            const user = new User({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              username: req.body.username,
              password: hashedPassword,
            }).save(saveErr => {
              if (saveErr) return res.status(404).json({err: saveErr});
              return res.status(201).json({message: "successfully made user"});
            });
          }
        });
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

  (req, res) => {
    const errors = validationResult(req);

    bcryptjs.hash(req.body.password, 10, (err, hashedPassword) => {
      if(err) return res.status(404).json({err: err});
      if(!errors.isEmpty()) return res.status(404).json({err: errors});

      const user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: hashedPassword,
      };

      User.findByIdAndUpdate(req.params.userID, user, {}, function(updateErr, updatedUser){
        if (updateErr) return res.status(404).json({err: updateErr});
        return res.status(201).json({message: "user updated successfully"});
      });
    });
  }
];

// If a user is deleted, they must also be removed from existing friendslists,
// and their post array must be deleted as well
exports.user_delete = function(req, res){
  Post.deleteMany({author: req.params.userID}, function(err){
    if (err) return res.status(404).json({err: err, message: "could not delete user's posts"});
    User.findByIdAndDelete(req.params.userID, function(err){
      if (err) return res.status(404).json({err: err, message: "could not delete user"});
      return res.status(200).json({message: "user deleted successfully"});
    });
  });
};

// TODO: Maybe check that they aren't already friends
exports.user_friend_post = function(req, res){
  // Check that both userID and friendID exists, then cross push IDs into each.
  User.find({ $or: [{_id: req.params.userID}, {_id: req.body.friendID}]})
  .exec(function(err, users){
    if (err) return res.status(404).json({err: "failed to find users by ID"});
    if (users.length !== 2) return res.status(404).json({err: "one or more users DNE"});
    User.findByIdAndUpdate(req.body.friendID, { $push: {friends: req.params.userID}}, function(err){
      if (err) return res.status(404).json({err: "failed to update user by friendID"});
      User.findByIdAndUpdate(req.params.userID, { $push: {friends: req.body.friendID}}, function(err){
        if (err) return res.status(404).json({err: "failed to update user by userID"});
        return res.status(200).json({message: `${req.body.friendID} and ${req.params.userID} are now friends`})
      });
    });
  });
};

exports.user_friend_delete = function(req, res){
  // Check that both userID and friendID exists, then cross pull IDs into each.
  User.find({ $or: [{_id: req.params.userID}, {_id: req.body.friendID}]})
  .exec(function(err, users){
    if (err) return res.status(404).json({err: "failed to find users by ID"});
    if (users.length !== 2) return res.status(404).json({err: "one or more users DNE"});
    User.findByIdAndUpdate(req.body.friendID, { $pull: {friends: req.params.userID}}, function(err){
      if (err) return res.status(404).json({err: "failed to update user by friendID"});
      User.findByIdAndUpdate(req.params.userID, { $pull: {friends: req.body.friendID}}, function(err){
        if (err) return res.status(404).json({err: "failed to update user by userID"});
        return res.status(200).json({message: `${req.body.friendID} and ${req.params.userID} are no longer friends`})
      });
    });
  });
};

exports.user_request_post = function(req, res){

};

exports.user_request_delete = function(req, res){

};

// Add user_login and user_logout