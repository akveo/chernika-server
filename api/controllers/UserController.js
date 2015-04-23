
module.exports = {
    
    login: function (req, res, next) {
		if (!req.params.user_id || !req.params.access_token) {
			return res.send(400, 'Incorrect parameters');
		}
		UserService.login(req.params.user_id, req.params.access_token)
			.then(function() {
				return next();
			})
			.fail(function (error) {
				logger.error('Login error: ' + error);
				res.send(500, 'Internal error');
			});
    },
	
	find: function(req, res) {
		UserService.find(req.params.userId)
			.then(function(user) {
				res.send(user || {});
			})
			.fail(function (error) {
				res.send(500, 'Internal error');
			});
	},
	
	getSettings: function (req, res) {
		UserService.getSettings(req.params.userId)
			.then(function(settings) {
				res.send(settings || {});
			})
			.fail(function (error) {
				res.send(500, 'Internal error');
			});
    },
	
	updateSettings: function (req, res) {
		res.send(204);
    },
	
	findPhotos: function (req, res) {
		UserService.findPhotos(req.params.userId, req.params.type)
			.then(function(photos) {
				res.send(photos);
			})
			.fail(function (error) {
				res.send(500, 'Internal error');
			});
	}
};


