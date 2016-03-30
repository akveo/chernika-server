
module.exports = {
	
	create: function () {
		var winston = require('winston');
		var Mail = require('winston-mail').Mail;
		var logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)({ 'timestamp': true, json: true }),
				new (Mail)({
					from: config.emailSettings.from || "winston logger",
					to: config.emailSettings.email,
					port: config.emailSettings.port,
					host: config.emailSettings.host,
					secure: config.emailSettings.ssl,
					username: config.emailSettings.user,
					password: config.emailSettings.password,
					level: "error" })
			]
		});

		logger.handleExceptions(
			new (Mail)({
				from: config.emailSettings.from || "winston logger chernika",
				to: config.emailSettings.email,
				port: config.emailSettings.port,
				host: config.emailSettings.host,
				secure: config.emailSettings.ssl,
				username: config.emailSettings.user,
				password: config.emailSettings.password
			}));

		return logger;
	}
};
