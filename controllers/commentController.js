const { body, validationResult } = require('express-validator');

const Comment = require('../models/comment');
const Post = require('../models/post');

exports.commentlist_get = function(req, res){
  Comment.find({post: req.params.postID})
  .exec(function(err, commentList){
    if(err) return res.status(404).json({err: err});
    if(!commentList) return res.status(404).json({err: "could not retrieve comment list or comments DNE"});
    return res.status(200).json(commentList);
  });
};

exports.comment_post = [
  body('text', 'Text content must not be empty.').trim().isLength({min: 1}).escape(),
  
  (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(404).json({err: errors});

    const comment = new Comment({
      text: req.body.text,
      timestamp: new Date(),
      author: req.user._id,
      authorString: req.user.firstname + ' ' + req.user.lastname,
      post: req.params.postID,
    })
    .save((saveErr, comment) => {
      if (saveErr) return res.status(404).json({err: saveErr});
      Post.findByIdAndUpdate(req.params.postID, { $push: {comments: comment._id}}, function(err){
        if (err) return res.status(404).json({err: err, message: "created comment but could not save to post"});
        return res.status(201).json({message: "successfully made comment"});
      });
    });

    // .save(saveErr => {
    //   if (saveErr) return res.status(404).json({err: saveErr});
    //   return res.status(201).json({message: "successfully made comment"});
    // });
  }
];

exports.comment_get = function(req, res){
  Comment.findById(req.params.commentID)
  .exec(function(err, comment){
    if (err) return res.status(404).json({err: err, message: "error retrieving comment"});
    if (!comment) return res.status(404).json({err: "could not retive comment by ID or comment DNE"});
    return res.status(200).json(comment);    
  });
};

// Keep comments simple, maybe don't allow for editing pre-existing comments?
// exports.comment_put = function(req, res){

// };

exports.comment_delete = function(req, res){
  Comment.findById(req.params.commentID)
  .exec(function(err, comment){
    if (err) return res.status(404).json({err: err, message: "error deleting comment"});
    if (comment.author.toString() !== req.user._id.toString()){
      return res.status(404).json({err: err, message: "user not authorized to delete other's comments"});
    } else {
      Comment.findByIdAndDelete(req.params.commentID)
      .exec(function(err, comment){
        if (err) return res.status(404).json({err: err, message: "error retrieving comment"});
        if (!comment) return res.status(404).json({err: "could not retrieve comment by ID or comment DNE"});
        return res.status(200).json({message: "comment successfully deleted"});    
      });
    }
  });
};