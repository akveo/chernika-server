
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {

	init: function () {
	
		var s = config.dbSettings;
		mongoose.connect('mongodb://{0}/{1}'.format(s.host, s.database));
		
		GLOBAL['Account'] = mongoose.model('Account', { 
			id: Integer, 
			first_name: String, 
			last_name: String, 
			sex: Integer, 
			photo_max_orig: String
		});
	}
}

