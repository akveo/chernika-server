
module.exports = {

	findProfile: function (req, res) {
		if (!req.params.id) {
			return res.send(400, 'Incorrect parameters');
		}
	
		UserService.getUserWithPhotos(req.params.id, req.params.photoType)
			.then(function(user) {
				res.send(user);
			})
			.fail(function (error) {
				logger.error('findProfile: ' + error);
				res.send(500, 'Internal error');
			});
	},

    getProfileInfo: function (req, res) {
        UserService.getInfo(req.params.userId)
            .then(function (profileInfo) {
                res.send(profileInfo);
            })
            .fail(function (error) {
                logger.error('getProfileInfo: ' + error);
                res.send(500, 'Internal error');
            })
    }
};


