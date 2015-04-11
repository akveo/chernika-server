
var crypto = require('crypto');

module.exports = {
	
	cipher: function(text){
		var cipher = crypto.createCipher(config.crypto.algorithm, config.crypto.password)
		var crypted = cipher.update(text,'utf8','hex')
		crypted += cipher.final('hex');
		return crypted;
	},
	 
	decipher: function(text){
		var decipher = crypto.createDecipher(config.crypto.algorithm, config.crypto.password)
		var dec = decipher.update(text,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}
}