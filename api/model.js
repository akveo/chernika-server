
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
		
		//User
		var userSchema = require('./models/User');
		userSchema.plugin(autoIncrement.plugin, {
			model: 'User',
			field: 'id',
			startAt: 1
		});
		userSchema.index({ "lastKnownPosition": "2dsphere" });
		GLOBAL['User'] = mongoose.model('User', userSchema);
		
		//Match
		var matchSchema = require('./models/Match');
		GLOBAL['Match'] = mongoose.model('Match', matchSchema);

        //Messae
        var messageSchema = require('./models/Message');
        GLOBAL['Message'] = mongoose.model('Message', messageSchema);

        var chatSchema = require('./models/Chat');
        GLOBAL['Chat'] = mongoose.model('Chat', chatSchema);
	}
}

