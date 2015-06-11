
var q = require('q');

module.exports = {

    findByGeo: function (userId, lon, lat) {
        var self = this;

        lon = parseFloat(lon);
        lat = parseFloat(lat);
        return UserService.update(userId,{ lastKnownPosition: { type:'Point', coordinates: [lon, lat] }})
            .then(self._getFindByGeoParams)
            .then(self._findByGeo);
    },

    _getFindByGeoParams: function(user) {
        var deferred = q.defer();

        var params = {
            maxDistance: user.settings.distance || 100,
            sex: user.settings.show ? [user.settings.show] : [1, 2],
            minAge: user.settings.minAge,
            maxAge: user.settings.maxAge,
            position: user.lastKnownPosition
        };

        getLikedUsers(user._id)
            .then(function(uIds) {
                uIds.push(user._id);
                params.likedUsers = uIds;
                deferred.resolve(params);
            });

        return deferred.promise;
    },

    _findByGeo: function (params) {
        var deferred = q.defer();

        User.geoNear(params.position, {
            maxDistance: params.maxDistance / 6371, // km to radians
            distanceMultiplier: 6371, // radians to km
            spherical: true,
            query: {
                _id: { $nin: params.likedUsers },
                sex: { $in: params.sex },
                age: {
                    $gte: params.minAge,
                    $lte: params.maxAge
                }
            }
        }, function (err, users) {
            deferred.resolve(users)
        });

        return deferred.promise;
    },

    getLikedUsers: getLikedUsers,
	
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
 };

function getLikedUsers(userId) {
    var deferred = q.defer();

    Match.find({user: userId}, function (err, matches) {
        var userIds = matches.map(function (m) {
            return m.target;
        });
        deferred.resolve(userIds);
    });

    return deferred.promise;
}
