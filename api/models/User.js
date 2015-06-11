var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	vkId: Number, 
	firstName: String,
	sex: Number, 
	age: Number,
	lastKnownPosition: { type: { type: String }, coordinates: [Number] },
	settings: {
		enableFriends: Boolean,
		distance: Number,
		minAge: Number,
		maxAge: Number,
		show: Number
	},
	photo: {
		src: String,
		width: Number,
		height: Number,
		crop: {
			x: Number,
			y: Number,
			width: Number,
			height: Number
		}
	}
});

userSchema.methods.initSettings = function() {
	this.settings = {
		enableFriends: true,
		distance: 100,
		minAge: 18,
		maxAge: 34,
		show: this.sex == 1 ? 2 
			: this.sex == 2 ? 1
			: 0
	}
}

module.exports = userSchema;