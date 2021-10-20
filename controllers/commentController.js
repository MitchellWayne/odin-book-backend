// Change to get comments for ONLY :postID
exports.commentlist_get = function(req, res){
  Comment.find()
  .exec(function(err, commentList){
    if(err) return res.status(404).json({err: err});
    if(!commentList) return res.status(404).json({err: "could not retrieve comment list or comments DNE"});
    return res.status(200).json(commentList);
  });
};

exports.comment_post = function(req, res){

};

exports.comment_get = function(req, res){

};

exports.comment_put = function(req, res){

};

exports.comment_delete = function(req, res){

};