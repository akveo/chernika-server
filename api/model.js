
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {

	init: function () {
	
		var s = config.dbSettings;
		mongoose.connect('mongodb://{0}/{1}'.format(s.host, s.database));
		
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
		// user.id = 126;
		// user.first_name = 'Test4';
		// user.last_name = 'Test4';
		// user.sex = 1;
		// user.photo = '';
		// user.lastKnownPosition = {
			// lon: 53.9524445,
			// lat: 27.7131621
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

