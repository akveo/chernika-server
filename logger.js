
module.exports = {
	
	create: function () {
		var winston = require('winston');
		var logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)({ 'timestamp': true, json: true })
				//,new (winston.transports.File)({ filename: config.logFilePath, 'timestamp': true })
			],
			levels: {
				info: 0,
				//data: 1,
				error: 2
			},
		});
		//logger.handleExceptions(new winston.transports.File({ filename: config.logExceptionFilePath, 'timestamp': true }));
			
		return logger;
	}
}
