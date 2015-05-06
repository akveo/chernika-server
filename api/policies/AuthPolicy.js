
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
		try {
			var token = JSON.parse(encryptor.decipher(req.headers['access-token']));
			if (token.id && new Date().getTime() > token.ts) {
				req.params.userId = token.id;
				return next();
			}
		} catch(exc) { }

		res.send(403, "You are not permitted to perform this action.");
	}
};