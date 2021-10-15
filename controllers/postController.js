const Post = require('../models/post');

exports.postlist_get = function(req, res){
  Post.find()
  .exec(function(err, postList){
    if(err) return res.status(404).json({err: err});
    if(!postList) return res.status(404).json({err: "could not retrieve post list or posts DNE"});
    return res.status(200).json(postList);
  });
};

exports.post_post = function(req, res){

};

exports.post_get = function(req, res){

};

exports.post_put = function(req, res){

};

exports.post_delete = function(req, res){

};