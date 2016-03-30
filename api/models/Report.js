var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reportSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  target: {type: Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: {createdAt: 'created'}});

module.exports = reportSchema;