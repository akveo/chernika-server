
var chats = [{
		id: 1,
		message: 'Test1'
	}, {
		id: 2,
		message: 'Test2'
	}];

module.exports = {
    
	findAll: function(req, res) {
		res.send(chats);
	},
	
	find: function(req, res) {
		if (!req.params.chatId) {
			return res.send(400, 'Incorrect parameters');
		}
		res.send(chats[req.params.chatId] || {});
	},
	
	findMessages: function (req, res) {
		if (!req.params.chatId) {
			return res.send(400, 'Incorrect parameters');
		}
		res.send([]);
	},
	
	createMessage: function (req, res) {
		if (!req.params.chatId) {
			return res.send(400, 'Incorrect parameters');
		}
		res.send([]);
	}
};


