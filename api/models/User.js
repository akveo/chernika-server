var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  vkId: Number,
  firstName: String,
  sex: Number,
  age: Number,
  lastKnownPosition: {type: {type: String, default: 'Point'}, coordinates: {type: Array, default: [0, 0]}},
  lastActivity: Date,
  confirmPolicy: Boolean,
  settings: {
    enableFriends: Boolean,
    distance: Number,
    minAge: Number,
    maxAge: Number,
    show: Number
  },
  photos: [{
    src: String,
    width: Number,
    height: Number,
    crop: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
  devices: [{token: {type: String}, platform: {type: String}}]
});

userSchema.methods.initSettings = function () {
  this.settings = {
    confirmPolicy: false,
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