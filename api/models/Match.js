var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matchSchema = new Schema({
	userId: Number,
	targetId: Number, 
	like: Boolean
});

module.exports = matchSchema;