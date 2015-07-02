
var restify = require('restify');
var q = require('q');
var path = require('path');
var sockets = require('./sockets');
var vkApi = require('../vkApi');
initBasicComponents();

module.exports.init = function() {
	var server = restify.createServer();
	server
		.use(restify.fullResponse())
		.use(restify.bodyParser())
		.use(restify.queryParser());

    sockets.init(server.server);

    server.on('MethodNotAllowed', CORSPolicy.unknownMethodHandler);

	server.post("/user", UserController.login, AuthPolicy.login);

    server.use(AuthPolicy.checkSession);
	
    server.get("/user", UserController.find);
	server.get("/user/settings", UserController.getSettings);
	server.put("/user/settings", UserController.updateSettings);
	server.get("/user/photos", UserController.findPhotos);
	
	server.get("/profile/:id", ProfileController.findProfile);
    server.get("/profile/:id/info", ProfileController.getProfileInfo);
	
	server.get("/suggestions", SuggestController.findByGeo);
	server.post("/suggestions/like", SuggestController.like);
	server.post("/suggestions/dislike", SuggestController.dislike);
	
	server.get("/chats", ChatController.findAll);
	server.get("/chats/:chatId", ChatController.find);
	server.get("/chats/:chatId/messages", ChatController.findMessages);
	server.post("/chats/:chatId/messages", ChatController.createMessage);

    vkApi.init();
	 
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
};

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