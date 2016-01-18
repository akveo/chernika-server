var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    users:  [{type: Schema.Types.ObjectId, ref:'User'}]
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' }});

module.exports = chatSchema;
