
var q = require('q');
var _ = require('underscore')
var vkApi = require('../../vkApi');

module.exports = {

	login: function (userId) {
		var self = this;
		return this.find(userId)
			.then(function(user) {
				user = user || new User();
				return vkApi.getUserInfo(userId)
					.then(function(vkUser) {
						user.id = vkUser.id;
						user.first_name = vkUser.first_name;
						user.last_name = vkUser.last_name;
						user.sex = vkUser.sex;
						user.photo = vkUser.photo_max_orig;
						
						return self.save(user);
					}, function(err) {
						throw err;
					});
			});
	},
	
	find: function(userId) {
		var deferred = q.defer();
		User.findOne({ id: userId }, function (err, user) {
			if (!err) {
				deferred.resolve(user);
			} else {
				logger.info('Cannot save user: ', err);
				deferred.reject(err);
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
				
			}, function(err) {
				throw err;
			})
	},
	
	findPartners: function (userId, count) {
		var self = this;
		return this.find(userId)
			.then(function(user) {
				if (!user) return [];
				return self.getUsers(user.sex, count || 100)
					.then(function(users) {
						return users;
					}, function(err) {
						throw err;
					});
			});
	},
	
	getUsers: function (sex, count) {
		var deferred = q.defer();
		User.find({ sex: sex }, function (err, users) {
			if (!err) {
				deferred.resolve(users);
			} else {
				logger.info('Cannot save user: ', err);
				deferred.reject(err);
			}
		}).limit(count);
		return deferred.promise;
	}
}
