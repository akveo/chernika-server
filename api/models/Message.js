var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
  sender: {type: Schema.Types.ObjectId, ref: 'User'},
  chat: {type: Schema.Types.ObjectId, ref: 'Chat'},
  text: String,
  wasRead: {type: Boolean, default: false}
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});

module.exports = messageSchema;
