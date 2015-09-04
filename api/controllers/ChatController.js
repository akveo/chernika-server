
var chats = [{
		id: 1,
		message: 'Test1'
	}, {
		id: 2,
		message: 'Test2'
	}];

module.exports = {
    
	findAll: function(req, res) {
       ChatService.findChats(req.params.userId)
				 .then(function (chats) {
					 res.send(chats);
				 }, function (error) {
					 logger.error('findAll: ' + error);
					 res.send(500, 'Internal error');
				 })
	},

	getChatsInfo: function (req, res) {
		ChatService.getChatsInfo(req.params.userId)
			.then(function (chatsInfo) {
				res.send(chatsInfo);
			}, function (error) {
				logger.error('getChatsInfo: ' + error);
				res.send(500, 'Internal error');
			})
	},

	getMatchedChat: function (req, res) {
		ChatService.getMatchedChat(req.params.matchedProfileId)
			.then(function (chat) {
				res.send(chat)
			}, function (error) {
				logger.error('getMatchedChat: ' + error);
				res.send(500, 'Internal error');
			})
	},
	
	find: function(req, res) {
		if (!req.params.chatId) {
			return res.send(400, 'Incorrect parameters');
		}
        ChatService.find(req.params.chatId).then(function (chat) {
           res.send(chat);
        }, function (error) {
            logger.error('find: ' + error);
            res.send(500, 'Internal error');
        });
	},
	
	findMessages: function (req, res) {
		if (!req.params.chatId) {
			return res.send(400, 'Incorrect parameters');
		}
        ChatService.getMessages(req.params.chatId, req.params.skip).then(function(messages) {
            res.send(messages);
        }, function (error) {
            logger.error('findMessages: ' + error);
            res.send(500, 'Internal error');
        })
	},
	
	createMessage: function (req, res) {
		if (!req.params.chatId) {
			return res.send(400, 'Incorrect parameters');
		}
		res.send([]);
	}
};


