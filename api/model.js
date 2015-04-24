
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

module.exports = {

	init: function () {
	
		var s = config.dbSettings;
		var connection = mongoose.connect('mongodb://{0}:{1}/{2}'.format(s.host, s.port, s.database), function(err) {
			if (err) {
				logger.error('Mongodb connection error: ' + err);
			};
		});
		autoIncrement.initialize(mongoose.connection);
		
		var userSchema = new Schema({
			id: Number,
			vkId: Number, 
			firstName: String,
			sex: Number, 
			photo: String,
			lastKnownPosition: {
				lon: Number,
				lat: Number
			},
			settings: {
				enableFriends: Boolean,
				distance: Number,
				minAge: Number,
				maxAge: Number,
				show: Number
			}
		});
		userSchema.plugin(autoIncrement.plugin, {
			model: 'User',
			field: 'id',
			startAt: 1
		});
		userSchema.index({ "lastKnownPosition": "2dsphere" });
		
		GLOBAL['User'] = mongoose.model('User', userSchema);
		
		
		// var user = new User();
		// user.vkId = 3;
		// user.first_name = 'Test3';
		// user.sex = 1;
		// user.photo = '';
		// user.lastKnownPosition = {
			// lon: 53.894965, 
			// lat: 27.547369 
		// };
		
		// user.save(function (err) {
			// if (!err) {
				// logger.info('User saved successfully.');
			// } else {
				// logger.info('Cannot save user: ', err);
			// }
		// });
	}
}

