
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {

	init: function () {
	
		var s = config.dbSettings;
		mongoose.connect('mongodb://{0}/{1}'.format(s.host, s.database));
		
		var Account = mongoose.model('Account', { name: String, vkId: String });
		
		// var account = new Account({ name: 'Test', vkId: 'Test' });
		// account.save(function (err) {
			// if (err) {
				// logger.info('Cannot save account: ', err);
			// } else {
				// logger.info('Account saved successfully!');
			// }
		// });
	}
}

