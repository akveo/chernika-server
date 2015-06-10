
var q = require('q');

module.exports = {

    findByGeo: function (userId, lon, lat) {
        var deferred = q.defer();

        UserService.find(userId)
            .then(function(user) {
                if (!user) {
                    deferred.resolve([]);
                    return;
                }
                lon = parseFloat(lon);
                lat = parseFloat(lat);
                user.lastKnownPosition = {
                    lon: lon,
                    lat: lat
                };

                UserService.save(user);

                var maxDistance = user.settings.distance || 100;
                var sex = user.settings.show ? [user.settings.show] : [1, 2];

                Match.find({user: userId}, function (err, matches) {
                    var ids = matches.map(function (m) {
                        return m.target;
                    });

                    ids.push(user._id);

                    User.geoNear([lon, lat], {
                        maxDistance: maxDistance / 6371, // km to radians
                        distanceMultiplier: 6371, // radians to km
                        spherical: true,
                        query: {
                            _id: { $nin: ids },
                            sex: { $in: sex },
                            age: {
                                $gte: user.settings.minAge,
                                $lte: user.settings.maxAge
                            }
                        }
                    }, function (err, users) {
                        deferred.resolve(users)
                    })
                })
            });

        return deferred.promise;
	},
	
	dislike: function (userId, targetId) {
		var match = new Match();
		match.user = userId;
		match.target = targetId;
		match.like = false;
		
		return this.createMatch(match);
	},
	
	like: function (userId, targetId) {
		var match = new Match();
		match.user = userId;
		match.target = targetId;
		match.like = true;
		
		this.createMatch(match);
		return this.isOppositeMatched(userId, targetId)
			.then(function (isMatched) {
				if (isMatched) {
					ChatService.create(userId, targetId);
				}
				return !!isMatched;
			});
	},
	
	isOppositeMatched: function (userId, targetId) {
		var deferred = q.defer();
		Match.findOne({user: targetId, target: userId}, function (err, oppositeMatch) {
			
			deferred.resolve(oppositeMatch && oppositeMatch.like);
			if (err) {
				logger.info('Cannot return user.');
			}
		});
		return deferred.promise;
	},
	
	createMatch: function(match) {
		var deferred = q.defer();
		match.save(function (err) {
			if (!err) {
				deferred.resolve(match._id);
			} else {
				logger.info('Cannot save match: ', err);
				deferred.reject(err);
			}
		});
		return deferred.promise;
	}
 }
