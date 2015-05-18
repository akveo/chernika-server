
var encryptor = require('../../encryptor');

module.exports = {
	
	login: function(req, res) {
		var token = JSON.stringify({
			id: req.params.userId,
			ts: new Date().getTime() 
		});
		res.setHeader('Access-Token', encryptor.cipher(token));
		res.send(204);
	},

	checkSession: function (req, res, next) {

		if (config.withoutPolicy){
			return next();
		}

        AuthPolicy._setSessionParams(req);

        if (req.params.userId) {
            return next()
        }

		res.send(403, "You are not permitted to perform this action.");
	},

    _setSessionParams: function (req) {
        try {
            var token = JSON.parse(encryptor.decipher(req.headers['access-token']));
            if (token.id && new Date().getTime() > token.ts) {
                req.params.userId = token.id;
            }
        } catch (exc) {}
    }
};