var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matchSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  target: {type: Schema.Types.ObjectId, ref: 'User'},
  like: Boolean
});

module.exports = matchSchema;