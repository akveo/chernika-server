var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    users:  [{type: Schema.Types.ObjectId, ref:'User'}],
    messages:  [{type: Schema.Types.ObjectId, ref:'Message'}]
});

module.exports = chatSchema;
