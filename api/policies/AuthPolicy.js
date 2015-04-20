
var encryptor = require('../../encryptor')

module.exports = {
	
	login: function(req, res) {
		var session = JSON.stringify({
			id: req.params.user_id,
			ts: new Date().getTime() 
		});
		res.setCookie('session', encryptor.cipher(session));
		res.send(200);
	},
	
	checkSession: function (req, res, next) {

		if (config.withoutPolicy){
			return next();
		}
		
		try {
			var session = JSON.parse(encryptor.decipher(req.cookies.session));
			if (session.id && new Date().getTime() > session.ts) {
				req.params.userId = session.id;
				return next();
			}
		} catch(exc) { }
		
		res.send(403, "You are not permitted to perform this action.");
	}
}