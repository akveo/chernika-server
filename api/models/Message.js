var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    sender:  {type: Schema.Types.ObjectId, ref:'User'},
    chat:  {type: Schema.Types.ObjectId, ref:'Chat'},
    text: String,
    created: Date
});

module.exports = messageSchema;