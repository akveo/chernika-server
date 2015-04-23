
var q = require('q');
var _ = require('underscore')
var vkApi = require('../../vkApi');

module.exports = {

	login: function (vkId, accessToken) {
		var self = this;
		return this.findByFilter({ vkId: vkId })
			.then(function(user) {
				user = user || new User();
				return vkApi.login(vkId, accessToken)
					.then(function(vkUser) {
						user.vkId = vkUser.id;
						user.firstName = vkUser.first_name;
						user.sex = vkUser.sex;
						user.photo = vkUser.photo_max_orig;
						
						if (user.isNew) {
							user.settings = {
								enableFriends: true,
								distance: 100,
								minAge: 18,
								maxAge: 34,
								show: user.sex == 1 ? 2 
									: user.sex == 2 ? 1
									: 0
							}
						}
						return self.save(user);
					});
			});
	},
	
	find: function(id) {
		return this.findByFilter({ id: id });
	},
	
	findByFilter: function(filter) {
		var deferred = q.defer();
		User.findOne(filter, function (err, user) {
			deferred.resolve(user);
			if (err) {
				logger.info('Cannot return user.');
			}
		});
		return deferred.promise;
	},
	
	getSettings: function(id) {
		return this.find(id)
			.then(function(user) {
				return user && user.settings;
			});
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
		return this.find(userId)
			.then(function(user) {
				if (!user) return [];
				
				return vkApi.getUserPhotos(user.vkId)
					.then(function(photos) {						
						photos = _.map(photos, function (i) {
							return _.find(i.sizes, function(j) { 
								return j.type == (type || 'z') 
							}); 
						});
						return _.filter(photos, function (i) { return i; });
						
					})
			});
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
