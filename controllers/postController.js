const Post = require('../models/post');

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

};

exports.post_put = function(req, res){

};

exports.post_delete = function(req, res){

};