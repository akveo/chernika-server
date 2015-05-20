
module.exports = {
    
	like: function(req, res) {
		if (!req.params.targetId) {
			return res.send(400, 'Incorrect parameters');
		}
		SuggestService.like(req.params.userId, req.params.targetId)
			.then(function(isMatched) {
				res.send(200, {
					targetId: req.params.targetId,
					isMatched: isMatched
				});
			})
			.fail(function (error) {
				logger.error('Api like: %s', error.toString());
				res.send(500, 'Internal error');
			});
	},
	
	dislike: function(req, res) {
		if (!req.params.targetId) {
			return res.send(400, 'Incorrect parameters');
		}
		SuggestService.like(req.params.userId, req.params.targetId)
			.then(function() {
				res.send(204);
			})
			.fail(function (error) {
				logger.error('Api dislike: %s', error.toString());
				res.send(500, 'Internal error');
			});
	},
	
	findByGeo: function (req, res) {
		if (!req.params.lon, !req.params.lat) {
			return res.send(400, 'Incorrect parameters');
		}
		SuggestService.findByGeo(req.params.userId, req.params.lon, req.params.lat)
			.then(function(users) {
				res.send(users);
			})
			.fail(function (error) {
				logger.error('Api suggest by Geo: %s', error.toString());
				res.send(500, 'Internal error');
			});
	}
};


