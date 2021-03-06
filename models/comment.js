const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let commentSchema = new Schema({
  text: {type: String, required: true},
  timestamp: {type: String, required: true},
  likes: [{type: Schema.Types.ObjectId, ref: 'User', required: false}],
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  authorString: {type: String, required: true},
  post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
});

module.exports = mongoose.model('Comment', commentSchema);