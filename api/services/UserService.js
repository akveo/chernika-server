
var q = require('q');
var _ = require('underscore')
var vkApi = require('../../vkApi');

module.exports = {

	login: function (userId) {
		
		vkApi.getUserInfo(function(user) {
			var account =  new Account({
				id: user.Id, 
				first_name: user.first_name,
				last_name: user.last_name, 
				sex: user.sex, 
				photo_max_orig: user.photo_max_orig
			});
			
			var deferred = q.defer();
			account.save(function (err) {
				if (!err) {
					deferred.resolve();
				} else {
					logger.info('Cannot save account: ', err);
					deferred.reject(err);
				}
			});
			return deferred.promise;
			
		}, function(err) {
			throw err;
		});
	},
	
	find: function(userId) {
		var deferred = q.defer();
		Account.findOne({ id: userId }, function (err, user) {
			if (!err) {
				deferred.resolve(user);
			} else {
				logger.info('Cannot save account: ', err);
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
	}
}
