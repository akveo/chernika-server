
var q = require('q');
var VK = require('vksdk');
var vk = new VK(config.vkSettings);

module.exports = {
	
	init: function() {
		var deferred = q.defer();
		vk.requestServerToken();
		
		vk.on('serverTokenReady', function(token) {
			if (token && token.access_token) {
				vk.setToken(token.access_token);
				deferred.resolve();
			} else {
				deferred.reject();
			}
		});
		return deferred.promise;
	},
	
	getUserInfo: function(id) {
		var deferred = q.defer();
		vk.request('users.get', {'user_id' : id, 'fields': 'id, first_name, last_name, sex, photo_max_orig'}, function(r) {
			if (!r.error) {
				deferred.resolve(r.response);
			} else {
				deferred.reject(r.error);
			}
		});
		return deferred.promise;
	},
	
	getUserPhotos: function(id) {
		var deferred = q.defer();
		vk.request('photos.get ', {'owner_id' : id, 'album_id': 'profile', 'rev': 1}, function(r) {
			if (!r.error) {
				var photos = r.response.items.map(function (i) { return i.photo_604; });
				deferred.resolve(photos);
			} else {
				deferred.reject(r.error);
			}
		});
		return deferred.promise;
	}
}