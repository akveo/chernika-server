
var q = require('q');
var _ = require('underscore');
var vkApi = require('../../vkApi');
var imagesUtil = require('../images');

module.exports = {

	login: function (vkId, accessToken, clientVkUser) {
		var self = this;
		
		return this.findByFilter({ vkId: vkId })
			.then(function(user) {
				user = user || new User();

                function photosPromise() {
                    return user.isNew ? vkApi.getUserPhotos(vkId).then(cropPhotos) : user.photos;
                }

				return  q.all([vkApi.login(vkId, accessToken), photosPromise()])
					.spread(function(vkUser, photos) {
						user.vkId = vkUser.id;
						user.firstName = vkUser.first_name;
						user.sex = vkUser.sex;
						user.age =  clientVkUser ? vkBdateToAge(clientVkUser.bdate) : vkBdateToAge(vkUser.bdate); //Not very wonderful
                        user.photos = photos;

						if (user.isNew) {
							user.initSettings();
						}
						return self.save(user);
					});
			});
	},
	
	find: function(id) {
		return this.findByFilter({ _id: id });
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

    update: function (uId, update) {
        var deferred = q.defer();

        User.findByIdAndUpdate(uId, { $set: update }, { new: true }, function (err, res) {
            if (err) {
                logger.info('Cannot update user: ', err);
                deferred.reject(err);
            } else {
                deferred.resolve(res._doc)
            }
        });

        return deferred.promise;
    },
	
	updateSettings: function(params) {
		var self = this;
		return this.find(params.userId)
			.then(function(user) {
				var s = user.settings || {};
				s.enableFriends = params.enableFriends === true;
				s.distance = params.distance | 0;
				s.minAge = params.minAge | 0;
				s.maxAge = params.maxAge | 0;
				s.show = params.show | 0;

				user.settings = s;
				return self.save(user);
			});
	},

    updatePhotos: function(params) {
        var self = this;
        return this.find(params.userId)
            .then(function(user) {
                user.photos = params.photos ? params.photos : user.photos;
                return self.save(user);
            });
    },

    addDevice: function (params) {
        var self = this;
        var device = params.device;

        function isDeviceAlreadyAdded(userDevice) {
            return userDevice.token === device.token;
        }
        return this.find(params.userId)
            .then(function(user){
                if (!user.devices.some(isDeviceAlreadyAdded)) {
                    user.devices.push(device);
                }
                console.log(user.devices);
                return self.save(user);
            });
    },
	
	save: function(user) {
		var deferred = q.defer();
		user.save(function (err) {
			if (!err) {
				deferred.resolve(user._id);
			} else {
				logger.info('Cannot save user: ', err);
				deferred.reject(err);
			}
		});
		return deferred.promise;
	},

    getUserWithPhotos: function (userId, photoType) {
        return this.find(userId)
            .then(function(user) {
                if (!user) return {};
                return {
                    _id: user._id,
                    firstName: user.firstName,
                    vkId: user.vkId,
                    sex: user.sex,
                    age: user.age,
                    lastKnownPosition: user.lastKnownPosition,
                    photos: user.photos
                }
            });
    }
};


//Shit, ok for now
function vkBdateToAge(bdate) {
    bdate = bdate || '';

    var splittedBdate = bdate.split('.').map(function (el) {
        return parseInt(el);
    });

    if (splittedBdate.length == 1) {
        splittedBdate = [13, 11, 1970];
    } else if (splittedBdate.length == 2) {
        splittedBdate[2] = 1970;
    }

    return new Date(new Date - new Date(splittedBdate[2], splittedBdate[1] - 1, splittedBdate[0])).getFullYear()-1970
}

function cropPhotos(photos) {
    var cropPromises = [];

    photos = _.map(photos, function (i) {
        return _.find(i.sizes, function(j) {
            return j.type == 'z'
        });
    });

    photos = _.filter(photos, function (i) { return i && i.width; });
    _.each(photos, function (i) {
        cropPromises.push(imagesUtil.countCrop(i));
    });

    return q.all(cropPromises);
//        .then(function (result) {
//            console.log(result)
//            deferred.resolve(result)
//        }, function(err) {
//            logger.info('Cannot crop user photos', err);
//            deferred.reject(err);
//        });
}
