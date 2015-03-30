
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {

	create: function () {
	
		var s = config.dbSettings;
		mongoose.createConnection(s.host, s.database, s.port, { user: s.user, pass: s.password });
		
		var Account = mongoose.model('Account', { name: String, vkId: String });
		
		var account = new Account({ name: 'Test', vkId: 'Test' });
		account.save(function (err) {
			if (err) {
				logger.info('Cannot save account: ', err);
			} else {
				logger.info('Account saved sacussfully!');
			}
		});
	}
}

