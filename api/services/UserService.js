
var q = require('q');
var _ = require('underscore')
var vkApi = require('../../vkApi');
var imagesUtil = require('../images');

module.exports = {

	login: function (vkId, accessToken) {
		var self = this;
		
		return this.findByFilter({ vkId: vkId })
			.then(function(user) {
			
				user = user || new User();
				return q.all([vkApi.login(vkId, accessToken), self.getUserPhotos(vkId)])
					.spread(function(vkUser, photos) {
						user.vkId = vkUser.id;
						user.firstName = vkUser.first_name;
						user.sex = vkUser.sex;
						user.age =  vkBdateToAge(vkUser.bdate);
						user.photo = photos.length > 0 ? photos[0] : null;

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

    getInfo: function(id) {
        var deferred = q.defer();

        UserService.find(id).then(function (user) {
            deferred.resolve({
                id: user.id,
                firstName: user.firstName,
                photo: user.photo
            });
        }, function(err) {
            deferred.reject(err);
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
		var self = this;
		return this.find(userId)
			.then(function(user) {
				if (!user) return {};
				return self.getUserPhotos(user.vkId)
					.then(function(photos) {
                        console.log(photos);
						return {
							firstName: user.firstName,
							sex: user.sex,
							lastKnownPosition: user.lastKnownPosition,
							photos: photos
						};
					})
			});
	},
	
	getUserPhotos: function (userVkId, photoType) {
		var deferred = q.defer();

		vkApi.getUserPhotos(userVkId)
			.then(function(photos) {
                var cropPromises = [];
				photos = _.map(photos, function (i) {
					return _.find(i.sizes, function(j) { 
						return j.type == (photoType || 'z') 
					}); 
				});
				photos = _.filter(photos, function (i) { return i && i.width; });
				_.each(photos, function (i) { 
					cropPromises.push(imagesUtil.countCrop(i));
				});
				q.all(cropPromises)
                    .then(function (result) {
                        console.log(result);
                        deferred.resolve(result)
                    }, function(err) {
                        console.log('err');
                        console.log(err);
                    });
			});

        return deferred.promise;
	}
}

function countCrop(image) {
	var crop = {};
	
	if (image.width/image.height > config.photoCropFactor) {
		crop.width = image.height * config.photoCropFactor | 0;
		crop.x = (image.width - crop.width) / 2;
		crop.height = image.height;
		crop.y = 0;
	} else {
		crop.width = image.width;
		crop.x = 0;
		crop.height = image.width / config.photoCropFactor | 0;
		crop.y = (image.height - crop.height) / 2;
	}
	return crop;
}


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
