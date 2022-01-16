const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let postSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  authorString: {type: String, required: true},
  title: {type: String, required: true},
  text: {type: String, required: true},
  timestamp: {type: String, required: true},
  likes: [{type: Schema.Types.ObjectId, ref: 'User', required: false}],
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment', required: false}],
  edited: {type: Boolean, required: false},
  imgURL: {type: String, required: false},
});

module.exports = mongoose.model('Post', postSchema);