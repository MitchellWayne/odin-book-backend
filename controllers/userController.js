const { body, validationResult } = require('express-validator');

const User = require('../models/user');

exports.userlist_get = function(req, res, next){
  User.find()
  .exec(function(err, userList){
    if(err) return next(err);
    if(!userList) return res.status(404).json({err: "could not retrieve user list or users DNE"});
    return res.status(200).json(userList);
  });
};

exports.user_post = function(req, res){

};

exports.user_get = function(req, res){

};

exports.user_put = function(req, res){

};

exports.user_delete = function(req, res){

};