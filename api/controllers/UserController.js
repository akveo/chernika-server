
module.exports = {
    
    login: function (req, res, next) {
		if (!req.params.user_id || !req.params.access_token) {
			res.send(400, 'Incorrect parameters');
			return;
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
	
	isLoggedIn: function(req, res) {
		if (!req.params.userId) {
			res.send(400, 'Incorrect parameters');
			return;
		}
		res.send(204);
	},
	
	find: function (req, res) {
		if (!req.params.userId) {
			res.send(400, 'Incorrect parameters');
			return;
		}
		UserService.find(req.params.userId)
			.then(function(user) {
				res.send(user);
			})
			.fail(function (error) {
				res.send(500, 'Internal error');
			});
    },
	
	update: function (req, res) {
		res.send(204);
    },
	
	suggestByGeo: function (req, res) {
		if (!req.params.userId) {
			res.send(400, 'Incorrect parameters');
			return;
		}
		UserService.suggestByGeo(req.params.userId, req.params.count)
			.then(function(users) {
				res.send(users);
			})
			.fail(function (error) {
				logger.error('Api SuggestByGeo: %s', error.toString());
				res.send(500, 'Internal error');
			});
	},
	
	findPhotos: function (req, res) {
		if (!req.params.userId) {
			res.send(400, 'Incorrect parameters');
			return;
		}
		UserService.findPhotos(req.params.userId, req.params.type)
			.then(function(photos) {
				res.send(photos);
			})
			.fail(function (error) {
				res.send(500, 'Internal error');
			});
	}
};


