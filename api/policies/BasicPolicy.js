
module.exports = function (req, res, next) {

	if (config.withoutPolicy || isRequestSigned(req)){
		return next();
	}
	else {
		res.send(403, "You are not permitted to perform this action.");
	}
};