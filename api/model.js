
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {

	init: function () {
	
		var s = config.dbSettings;
		mongoose.connect('mongodb://{0}:{1}/{2}'.format(s.host, s.port, s.database), function(err) {
			if (err) {
				logger.error('Mongodb connection error: ' + err);
			};
		});
		
		var userSchema = new mongoose.Schema({
			id: Number, 
			first_name: String, 
			last_name: String, 
			sex: Number, 
			photo: String,
			lastKnownPosition: {
				lon: Number,
				lat: Number
			}
		});
		
		userSchema.index({ "lastKnownPosition": "2d" });
		
		GLOBAL['User'] = mongoose.model('User', userSchema);
		
		// var user = new User();
		// user.id = 3;
		// user.first_name = 'Test3';
		// user.last_name = 'Test3';
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

