var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    users:  [{type: Schema.Types.ObjectId, ref:'User'}],
    blocked: Boolean
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' }});


chatSchema.methods.initSettings = function() {
    this.blocked = false;
};

module.exports = chatSchema;
