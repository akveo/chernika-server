
var q = require('q');;
var VK = require('vksdk');
var vk = new VK(config.vkSettings);

module.exports = {
	
	login: function(userId, accessToken) {
		var self = this;
		return this.checkAccessToken(userId, accessToken)
			.then(function() {
				return self.getUserInfo(userId);
			}, function(err) {
				logger.error('Check access token: ' + err);
			});
	},
	
	checkAccessToken: function(userId, accessToken) {
		var deferred = q.defer();
		vk.request('users.get', {'access_token' : accessToken}, function(r) {
			
			deferred.resolve();
			// if (!r.error && r.response && r.response.length > 0) {
				// if (r.response[0].id == userId) {
					// deferred.resolve();
				// } else {
					// deferred.reject('Incorrect access token for user: %d', userId);
				// }
			// } else {
				// deferred.reject(r.error);
			// }
		});
		return deferred.promise;
	},
	
	getUserInfo: function(id) {
		var deferred = q.defer();
		vk.request('users.get', {'user_id' : id, 'fields': 'id, first_name, sex, photo_max_orig'}, function(r) {
			if (!r.error && r.response && r.response.length > 0) {
				if (!r.response[0].deactivated) {
					deferred.resolve(r.response[0]);
				} else {
					deferred.reject('User is diactivated');
				}
			} else {
				deferred.reject(r.error);
			}
		});
		return deferred.promise;
	},
	
	getUserPhotos: function(id) {
		var deferred = q.defer();
		vk.request('photos.get', {'owner_id' : id, 'album_id': 'profile', 'rev': 1, 'photo_sizes': 1}, function(r) {
			if (!r.error) {
				deferred.resolve(r.response.items);
			} else {
				deferred.reject(r.error);
			}
		});
		return deferred.promise;
	}
}