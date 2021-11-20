const { body, validationResult } = require('express-validator');

const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');

exports.postlist_get = function(req, res){
  Post.find({author: req.params.userID})
  .exec(function(err, postList){
    if(err) return res.status(404).json({err: err});
    if(!postList) return res.status(404).json({err: "could not retrieve post list or posts DNE"});
    return res.status(200).json(postList);
  });
};

exports.post_post = [
  body('title', 'Title must not be empty.').trim().isLength({min: 1}).escape(),
  body('text', 'Text content must not be empty.').trim().isLength({min: 1}).escape(),
  
  (req, res) => {
    if(req.user._id.toString() !== req.params.userID) {
      return res.status(404).json({message: "user not authorized for different user endpoints"});
    } else {
      const errors = validationResult(req);
      if(!errors.isEmpty()) return res.status(404).json({err: errors});

      const post = new Post({
        author: req.user._id,
        title: req.body.title,
        text: req.body.text,
        timestamp: Date.now(),
        edited: false,
      }).save((saveErr, post) => {
        if (saveErr) return res.status(404).json({err: saveErr});
        User.findByIdAndUpdate(req.user._id, { $push: {posts: post._id}}, function(err){
          if (err) return res.status(404).json({err: err, message: "created post but could not save to user"});
          return res.status(201).json({message: "successfully made post"});
        });
      });
    }
  }
];

exports.post_get = function(req, res){
  Post.findById(req.params.postID)
  .exec(function(err, post){
    if (err) return res.status(404).json({err: err, message: "error retrieving post"});
    if (!post) return res.status(404).json({err: "could not retrieve post by ID or post DNE"});
    return res.status(200).json(post);    
  });
};

exports.post_put = [
  body('title', 'Title must not be empty.').trim().isLength({min: 1}).escape(),
  body('text', 'Text content must not be empty.').trim().isLength({min: 1}).escape(),
  
  (req, res) => {
    if(req.user._id.toString() !== req.params.userID) {
      return res.status(404).json({message: "user not authorized for different user endpoints"});
    } else {
      const errors = validationResult(req);
      if(!errors.isEmpty()) return res.status(404).json({err: errors});

      const post = {
        title: req.body.title,
        text: req.body.text,
        timestamp: Date.now(),
        edited: true,
      }

      Post.findByIdAndUpdate(req.params.postID, post, {}, function(updateErr, updatedPost){
        if (updateErr) return res.status(404).json({err: updateErr});
        else res.status(201).json({message: "post updated successfully"});
      });
    }
  }
];

exports.post_delete = function(req, res){
  if(req.user._id.toString() !== req.params.userID) {
    return res.status(404).json({message: "user not authorized for different user endpoints"});
  } else {
    Comment.deleteMany({post: req.params.postID}, function(err){
      if (err) return res.status(404).json({err: err, message: "could not delete post comments"});
      Post.findByIdAndDelete(req.params.postID, function(delError){
        if(delError) return res.status(404).json({err: delError, message: "failed to deleted post by id"});
        User.findByIdAndUpdate(req.user._id, { $pull: {posts: req.params.postID}}, function(err){
          if (err) return res.status(404).json({err: err, message: "delete post but could not update user posts"});
          else return res.status(200).json({message: "post successfully deleted"});
        });
      });
    });
  }
};

// /:userID/posts/:postID is the receiving end, logged in user appends their userID to the postID like list
exports.post_like_post = function(req, res){
  Post.findByIdAndUpdate(req.params.postID, {$push: {likes: req.user._id}}, function(err){
    if (err) return res.status(404).json({err: err, message: "could not append current user to post likes"});
    else return res.status(200).json({message: "successfully added user to post likes"});
  });
};

exports.post_like_delete = function(req, res){
  Post.findByIdAndUpdate(req.params.postID, {$pull: {likes: req.user._id}}, function(err){
    if (err) return res.status(404).json({err: err, message: "could not pull current user from post likes"});
    else return res.status(200).json({message: "successfully pulled user from post likes"});
  });
};