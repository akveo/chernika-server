
module.exports = {
    
    login: function (req, res) {
		logger.info('API method account.login called.');
    },
	
	find: function (req, res) {
		
		if (!req.params.userId) {
			res.send(400, "Incorrect parameters");
			return;
		}
		
		vkApi = require('../../vkApi');
		vkApi.getUserInfo(req.params.userId)
			.then(function(userInfo) {
				res.send(userInfo);
			}, function(err) {
				logger.error("Account API error: " + err);
				res.send(500, "Internal error");
			})
    },
	
	findPhotos: function (req, res) {
		if (!req.params.userId) {
			res.send(400, "Incorrect parameters");
			return;
		}
		
		vkApi = require('../../vkApi');
		vkApi.getUserPhotos(req.params.userId)
			.then(function(photos) {
				res.send(photos);
			}, function(err) {
				logger.error("Account API error: " + err);
				res.send(500, "Internal error");
			})
	}
};


