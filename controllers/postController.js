const { body, validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.postlist_get = function(req, res){
  Post.find()
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
      }).save(saveErr => {
        if (saveErr) return res.status(404).json({err: saveErr});
        return res.status(201).json({message: "successfully made post"});
      });
    }
  }
];

exports.post_get = function(req, res){
  Post.findById(req.params.postID)
  .exec(function(err, post){
    if (err) return res.status(404).json({err: err, message: "error retrieving post"});
    if (!post) return res.status(404).json({err: "could not retive post by ID or post DNE"});
    return res.status(200).json(post);    
  });
};

// TODO: Maybe define 'edited' boolean to model and force true on post_put
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
      }

      Post.findByIdAndUpdate(req.params.postID, post, {}, function(updateErr, updatedPost){
        if (updateErr) return res.status(404).json({err: updateErr});
        else res.status(201).json({message: "post updated successfully"});
      });
    }
  }
];

// TODO: Will need to check and delete relevant comments as well
exports.post_delete = function(req, res){
  if(req.user._id.toString() !== req.params.userID) {
    return res.status(404).json({message: "user not authorized for different user endpoints"});
  } else {
    Post.findByIdAndDelete(req.params.postID, function(delError){
      if(delError) return res.status(404).json({err: delError, message: "failed to deleted post by id"});
      else return res.status(200).json({message: "post successfully deleted"});
    });
  }
};

// TODO: post_like_post and post_like_delete (public methods)
//  Add or Remove req.user._id to req.params.userID.postID.likes[{...}]