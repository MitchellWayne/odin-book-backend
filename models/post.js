const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let postSchema = new Schema({
  title: {type: String, required: true},
  text: {type: String, required: true},
  timestamp: {type: String, required: true},
  likes: [{type: Schema.Types.ObjectId, ref: 'User', required: false}],
  author: [{type: Schema.Types.ObjectId, ref: 'User', required: true}],
});

module.exports = mongoose.model('Post', postSchema);