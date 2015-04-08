
module.exports = {
    
    login: function (req, res) {
		if (!req.params.userId) {
			res.send(400, "Incorrect parameters");
			return;
		}
		UserService.login(req.params.userId)
			.then(function() {
				res.send('OK');
			}, function(err) {
				logger.error("Account API error: " + err);
				res.send(500, "Internal error");
			})
    },
	
	find: function (req, res) {
		if (!req.params.userId) {
			res.send(400, "Incorrect parameters");
			return;
		}
		UserService.find(req.params.userId)
			.then(function(user) {
				res.send(user);
			}, function(err) {
				logger.error("Account API error: " + err);
				res.send(500, "Internal error");
			})
    },
	
	findPartners: function (req, res) {
		if (!req.params.userId) {
			res.send(400, "Incorrect parameters");
			return;
		}
		UserService.findPartners(req.params.userId, req.params.count)
			.then(function(partners) {
				res.send(partners);
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
		UserService.findPhotos(req.params.userId, req.params.type)
			.then(function(photos) {
				res.send(photos);
			}, function(err) {
				logger.error("Account API error: " + err);
				res.send(500, "Internal error");
			})
	}
};


