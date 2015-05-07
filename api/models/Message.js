var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    sender:  {type: Schema.Types.ObjectId, ref:'User'},
    match:  {type: Schema.Types.ObjectId, ref:'Match'},
    text: String,
    dispatchTime: Date
});

module.exports = messageSchema;