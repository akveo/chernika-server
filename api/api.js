
var restify = require('restify');
var q = require('q');
var path = require('path');
initBasicComponents();

module.exports.init = function() {
	var server = restify.createServer();
	server
		.use(restify.fullResponse())
		.use(restify.bodyParser())
		.use(restify.queryParser());
	
	server.post("/user", UserController.login, AuthPolicy.login);
	server.get("/user", AuthPolicy.checkSession, UserController.find);
	server.get("/user/settings", AuthPolicy.checkSession, UserController.getSettings);
	server.put("/user/settings", AuthPolicy.checkSession, UserController.updateSettings);
	server.get("/user/photos", AuthPolicy.checkSession, UserController.findPhotos);
	
	server.get("/suggestions", AuthPolicy.checkSession, SuggestController.findByGeo);
	server.get("/suggestions/like", AuthPolicy.checkSession, SuggestController.like);
	server.get("/suggestions/dislike", AuthPolicy.checkSession, SuggestController.dislike);
	
	server.get("/chats", AuthPolicy.checkSession, ChatController.findAll);
	server.get("/chats/:chatId", AuthPolicy.checkSession, ChatController.find);
	server.get("/chats/:chatId/messages", AuthPolicy.checkSession, ChatController.findMessages);
	server.post("/chats/:chatId/messages", AuthPolicy.checkSession, ChatController.createMessage);
	 
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