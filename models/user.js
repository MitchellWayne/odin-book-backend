const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  friends: [{type: Schema.Types.ObjectId, ref: 'User', required: false}], // Array of user IDs
  requests: [{type: Schema.Types.ObjectId, ref: 'User', required: false}], // Same as above
  requested: [{type: Schema.Types.ObjectId, ref: 'User', required: false}],
  posts: [{type: Schema.Types.ObjectId, ref: 'Post', required: false}],
  pfpURL: {type: String, required: false},
  about: {type: String, required: false},
});

module.exports = mongoose.model('User', userSchema);