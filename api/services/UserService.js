
var q = require('q');
var _ = require('underscore')
var vkApi = require('../../vkApi');

module.exports = {

	login: function (userId, accessToken) {
		var self = this;
		return this.find(userId)
			.then(function(user) {
				user = user || new User();
				return vkApi.login(userId, accessToken)
					.then(function(vkUser) {
						user.id = vkUser.id;
						user.first_name = vkUser.first_name;
						user.last_name = vkUser.last_name;
						user.sex = vkUser.sex;
						user.photo = vkUser.photo_max_orig;
						
						return self.save(user);
					});
			});
	},
	
	find: function(userId) {
		var deferred = q.defer();
		User.findOne({ id: userId }, function (err, user) {
			deferred.resolve(user);
			if (err) {
				logger.info('Cannot return user %d: %s', userId, err);
			}
		});
		return deferred.promise;
	},
	
	save: function(user) {
		var deferred = q.defer();
		user.save(function (err) {
			if (!err) {
				deferred.resolve();
			} else {
				logger.info('Cannot save user: ', err);
				deferred.reject(err);
			}
		});
		return deferred.promise;
	},
	
	findPhotos: function (userId, type) {
		return vkApi.getUserPhotos(userId)
			.then(function(photos) {
				
				photos = _.map(photos, function (i) {
					return _.find(i.sizes, function(j) { 
						return j.type == (type || 'z') 
					}); 
				});
				return _.filter(photos, function (i) { return i; });
				
			})
	},
	
	suggestByGeo: function (userId) {
		var self = this;
		return this.find(userId)
			.then(function(user) {
				if (!user) return [];
				
				var pos = user.lastKnownPosition;
				var maxDistance = user.maxDistance || 10;
				
				return User.geoNear([pos.lon, pos.lat], {
						maxDistance: maxDistance / 6371, // km to radians
						distanceMultiplier: 6371, // radians to km
						spherical: true
					})
					.then(function (users) {
						return users;
					});
			});
	}
}
