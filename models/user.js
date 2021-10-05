const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  userName: {type: String, required: true},
  friends: [{type: Schema.Types.ObjectId, ref: 'User', required: false}], // Array of user IDs
  requests: [{type: Schema.Types.ObjectId, ref: 'User', required: false}], // Same as above
  posts: [{type: Schema.Types.ObjectId, ref: 'Post', required: false}],
});

module.exports = mongoose.model('User', userSchema);