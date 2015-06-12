
var q = require('q');
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
        this.secureRequest('secure.checkToken', {'token' : accessToken}, function(r) {
            if (!r.error && r.response) {
                if (r.response.user_id == userId) {
                    deferred.resolve();
                } else {
                    deferred.reject('Incorrect access token for user: %d', userId);
                }
            } else {
                deferred.reject(r.error);
            }
        });
        return deferred.promise;
    },
	
	getUserInfo: function(id) {
		var deferred = q.defer();
		vk.request('users.get', {'user_id' : id, 'fields': 'id, first_name, sex, bdate'}, function(r) {
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
	},

    secureRequest: function(_method, _requestParams, _response) {
        vk.setSecureRequests(true);
        vk.request(_method, _requestParams, _response);
        vk.setSecureRequests(false);
    },

    setServerToken: function() {
        var deferred = q.defer();
        vk.requestServerToken(function (res) {
            vk.setToken(res.access_token);
            deferred.resolve(res.access_token);
        });
        return deferred.promise;
    },

    init: function () {
        var deferred = q.defer;
        this.setServerToken()
            .then(function () {
                deferred.resolve();
            });
        return deferred.promise;
    }
}
