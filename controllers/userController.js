const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

require('dotenv').config();

// TODO:
//  Nesting Model and Query operations seem inefficient,
//    Potentially need to look for another way to accomplish this more cleanly

// Split User_Put into seperate API endpoints

// Helpers ------------------

function isObjectId(id) {
  if (id.match(/^[0-9a-fA-F]{24}$/)) return true;
  else return false;
}

async function userExists(id) {
  let check = await User.exists({ _id: id});
  if (check) return true;
  else return false;
}

async function areFriends(user1, user2){
  let confirmU1 = await User.exists({ _id: user1, friends: { $elemMatch: {$eq: user2}}});
  let confirmU2 = await User.exists({ _id: user2, friends: { $elemMatch: {$eq: user1}}});
  console.log("Users are friends: " + (confirmU1 && confirmU2));
  return (confirmU1 && confirmU2);
}

async function requestExists(user1, user2){
  let confirmed = await User.exists({ _id: user1, requests: { $elemMatch: {$eq: user2}}});
  console.log("Request exists: " + confirmed);
  return confirmed;
}

async function makeFriends(user1, user2, res){
  User.findByIdAndUpdate(user1, {$push: {friends: user2}}, function(err){
    if (err) return res.status(404).json({err: err, message: `could not add ${user2} to ${user1}'s friends field`});
    User.findByIdAndUpdate(user2, {$push: {friends: user1}}, function(err){
      if (err) return res.status(404).json({err: err, message: `could not add ${user1} to ${user2}'s friends field`});
      return res.status(200).json({message: `successfully made ${user1} and ${user2} friends`});
    });
  });
}

// APIs ---------------------

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

exports.user_put = [
  body('firstname', 'First name must not be empty.').trim().isLength({min: 1}).escape(),
  body('lastname', 'Last name must not be empty.').trim().isLength({min: 1}).escape(),
  body('username', 'Username must not be empty.').trim().isLength({min: 1}).escape(),
  body('password', 'Please enter a strong password of minimum length 8, at least one uppercase and lowercase letter, one number, and one symbol.').trim().isStrongPassword(),

  (req, res) => {
    if(req.user._id.toString() !== req.params.userID) {
      return res.status(404).json({message: "user not authorized for different user endpoints"});
    } else {
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
  }
];

// If a user is deleted, they must also be removed from existing friendslists,
// and their post array must be deleted as well
exports.user_delete = function(req, res){
  Post.deleteMany({author: req.params.userID}, function(err){
    if (err) return res.status(404).json({err: err, message: "could not delete user's posts"});
    User.updateMany(
      {friends: {$elemMatch: {$eq: req.params.userID}}},
      {$pull: {friends: req.params.userID}},
      function(err){
        if (err) return res.status(404).json({err: err, message: "could not remove user from existing friend lists"});
        User.findByIdAndDelete(req.params.userID, function(err){
          if (err) return res.status(404).json({err: err, message: "could not delete user"});
          return res.status(200).json({message: "user deleted successfully"});
        });
    });
  });
};

exports.user_friend_post = async function(req, res){
  // Logic is ordered like so:
  // - Check if ID valid so no crashes
  //  - Check if users even exists
  //   - Make sure they aren't already friends
  //    - Check if request exists 
  //     - Remove the related request from userID
  //      - Add friends
  if (isObjectId(req.body.friendID) && isObjectId(req.params.userID)){
    if (await userExists(req.body.friendID) && userExists(req.params.userID)){
      if(!(await areFriends(req.body.friendID, req.params.userID))){
        if (await requestExists(req.params.userID, req.body.friendID)){
          User.findByIdAndUpdate(req.params.userID, {$pull: {requests: req.body.friendID}}, function(err){
            if (err) return res.status(404).json({err: err, message: "Could not update user's (userID) requests or request does not exist"});
            else {
              makeFriends(req.params.userID, req.body.friendID, res);
            }
          });
        } else return res.status(404).json({message: "no matching friend requests exist for this user"});
      } else return res.status(404).json({message: "users are already friends"});
    } else return res.status(404).json({message: "issuing or receiving user dne"});
  } else return res.status(404).json({message: "invalid objectid formatting"});
};

// Maybe refactor to use userExists, but this still works either way
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

exports.user_request_post = async function(req, res){
  if (isObjectId(req.body.friendID) && isObjectId(req.params.userID)){
    if (await userExists(req.body.friendID) && await userExists(req.params.userID)){
      if (!(await areFriends(req.body.friendID, req.params.userID))){
        User.findByIdAndUpdate(req.params.userID, { $push: {requests: req.body.friendID}}, function(err){
          if (err) return res.status(404).json({err: err, message: "could not push to user requests"});
          return res.status(200).json({message: "successfully pushed request to user"});
        });
      } else return res.status(404).json({message: "users are already friends"});
    } else return res.status(404).json({message: "issuing or receiving user dne"});
  } else return res.status(404).json({message: "invalid objectid formatting"});
};

exports.user_request_delete = function(req, res){
  if (isObjectId(req.body.friendID) && isObjectId(req.params.userID)){
    if (userExists(req.body.friendID) && userExists(req.params.userID)){
      User.findByIdAndUpdate(req.params.userID, { $pull: {requests: req.body.friendID}}, function(err){
        if (err) return res.status(404).json({err: err, message: "could not pull from user requests"});
        return res.status(200).json({message: "successfully pulled request from user"});
      });
    } else return res.status(404).json({message: "issuing or receiving user dne"});
  } else return res.status(404).json({message: "invalid objectid formatting"});
};

exports.user_login_post = function(req, res, next){
  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err || !user) return res.status(400).json({err: err, message: info });
    req.login(user, {session: false}, (err) => {
      if (err) res.send(err);
      const token = jwt.sign({user}, process.env.JWT_SECRET, {expiresIn: '12h'});
      return res.json({user, token});
    });
  })(req, res, next);
};

exports.user_logout_post = function(req, res){
  req.logout();
  return res.json({message: 'logged out successfully'});
};