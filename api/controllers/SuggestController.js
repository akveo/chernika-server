
var counter = 0;

module.exports = {
    
	like: function(req, res) {
		if (!req.params.targetId) {
			return res.send(400, 'Incorrect parameters');
		}
		res.send(200, {
			targetId: req.params.targetId,
			isMatched: !!(++counter % 3 == 0)
		});
	},
	
	dislike: function(req, res) {
		if (!req.params.targetId) {
			return res.send(400, 'Incorrect parameters');
		}
		res.send(204);
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


