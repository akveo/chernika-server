
var encryptor = require('../../encryptor');

module.exports = {
	
	login: function(req, res) {
		var token = JSON.stringify({
			id: req.params.userId,
			ts: new Date().getTime() 
		});
		res.setHeader('Access-Token', encryptor.cipher(token));
        res.setHeader('Access-Control-Expose-Headers', 'Access-Token');
		res.send(204);
	},

	checkSession: function (req, res, next) {

		if (config.withoutPolicy){
			return next();
		}

        req.params.userId = AuthPolicy._getTokenId(req.headers['access-token']);

        if (req.params.userId) {
            return next()
        }

		res.send(403, "You are not permitted to perform this action.");
	},

    _getTokenId: function (encryptedToken) {
        try {
            var token = JSON.parse(encryptor.decipher(req.headers['access-token']));
            if (token.id && new Date().getTime() > token.ts) {
                return token.id;
            }
        } catch (exc) {}
    }
};