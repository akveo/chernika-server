
var restify = require('restify');
var q = require('q');
var path = require('path');
initBasicComponents();

module.exports.init = function() {
	var server = restify.createServer();
	server.use(restify.fullResponse())
		  .use(restify.queryParser())
		  .use(restify.bodyParser());
	
	server.post("/account", BasicPolicy, AccountController.login);
	server.get("/account", BasicPolicy, AccountController.find);
	server.get("/account/photos", BasicPolicy, AccountController.findPhotos);
	 
	var deferred = q.defer();
	var port = config.apiPort;
	server.listen(port, function (err) {
		if (err) {
			logger.error(err);
			deferred.reject();
		} else {
			logger.info('API is ready at : ' + port);
			deferred.resolve();
		}
	});
	return deferred.promise;
}

function initBasicComponents() {
	var fs = require('fs'); 
	initComponent('controllers');
	initComponent('services');
	initComponent('policies');

	function initComponent(component) {
		var root = path.dirname(require.main.filename);
		var componentPath = root + '/api/' + component;
		fs.readdirSync(componentPath).forEach(function (file) {
			if (file.indexOf('.js') != -1) {
				GLOBAL[file.split('.')[0]] = require(componentPath + '/' + file);
			}
		})
	}
}