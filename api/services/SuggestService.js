
var q = require('q');

module.exports = {

	findByGeo: function (userId, lon, lat) {

		return UserService.find(userId)
			.then(function(user) {
				if (!user) return [];
				
				lon = parseFloat(lon);
				lat = parseFloat(lat);
				user.lastKnownPosition = {
					lon: lon, 
					lat: lat
				};
				UserService.save(user);
				
				var maxDistance = user.settings.distance || 100;
				return User.geoNear([lon, lat], {
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
