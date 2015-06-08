
var q = require('q');
var mongoose = require('mongoose');

module.exports = {

    find: function(id) {
        return this.findByFilter({ _id: id });
    },

    findByFilter: function(filter) {
        var deferred = q.defer();
        Chat.findOne(filter, function (err, chat) {
            deferred.resolve(chat);
            if (err) {
                logger.info('Cannot return chat.');
            }
        });
        return deferred.promise;
    },

    addMessage: function(message) {
        var deferred = q.defer();

        message.save(function (err) {
            if (!err) {
                deferred.resolve(message.id);
            } else {
                logger.info('Cannot save chat: ', err);
                deferred.reject(err);
            }
        });

        return deferred.promise;
    },

    markMessageRead: function (mId) {
        var deferred = q.defer();

        Message.findByIdAndUpdate(mId, { $set: { wasRead: true }}, { new: true }, function (err, msg) {
            if (err) {
                console.log(err)
                logger.info('Cannot update message: ', err);
                deferred.reject(err);
            } else {
                deferred.resolve(msg)
            }
        });

        return deferred.promise;
    },

    findChats: function (userId) {
        var deferred = q.defer();

        Chat.find({users: userId}, function (err, chats) {
            if (!err) {
                deferred.resolve(chats);
            } else {
                logger.info('Cannot find chats: ', err);
                deferred.reject(err);
            }
        });

        return deferred.promise;
    },

    getChatsInfo: function(userId) {
        var deferred = q.defer();

        var promises = [];

        ChatService.findChats(userId).then(function(chats) {
            chats.forEach(function(c) {
                promises.push(ChatService.getInfo (c, userId));
            });
            q.all(promises).then(function(res) {
                deferred.resolve(res)
            });
        });

        return deferred.promise;
    },

    getInfo: function(chat, infoReceiverId) {
        var deferred = q.defer();

        var userForInfoId = chat.users[0] == infoReceiverId ? chat.users[1] : chat.users[0];
        var info = {
            chat: chat._id
        };

        UserService.getInfo(userForInfoId)
            .then(function(user) {
                info.user = user;
                return ChatService.getLastChatMessage(chat._id)
            })
            .then(function(message) {
                info.message = message;
                deferred.resolve(info)
            }, function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    },

    getMessages: function(chatId) {
        return ChatService.getMessagesDuringInterval(chatId, new Date(null), new Date());
    },

    getMessagesDuringInterval: function (chatId, from, until) {
        var deferred = q.defer();

        Message.aggregate([
            {
                $match: {
                    chat: mongoose.Types.ObjectId(chatId),
                    created: {
                        $gte: from,
                        $lte: until
                    }
                }
            },
            {
                "$sort": {
                    "created": 1
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "text": 1,
                    "created": 1,
                    "sender": 1,
                    "chat": 1,
                    "wasRead": 1
                }
            }
        ], function(err, messages) {
            if (!err) {
                deferred.resolve(messages);
            } else {
                logger.info('Cannot find messages during interval: ', err);
                deferred.reject(err);
            }
        });


        return deferred.promise;
    },

    getLastChatMessage: function(chatId) {
        var deferred = q.defer();

        Message.aggregate([
            {
                "$match": {
                    "chat": chatId
                }
            },
            {
                "$sort": {
                    "created": -1
                }
            },
            {
                "$group": {
                    "_id": null,
                    "msgId": {
                        "$first": "$_id"
                    },
                    "chat": {
                        "$first": "$chat"
                    },
                    "text": {
                        "$first": "$text"
                    },
                    "created": {
                        "$first": "$created"
                    },
                    "sender": {
                        "$first": "$sender"
                    },
                    "wasRead": {
                        "$first": "$wasRead"
                    }
                }
            },
            {
                "$project": {
                    "_id": "$msgId",
                    "text": 1,
                    "created": 1,
                    "sender": 1,
                    "chat": 1,
                    "wasRead": 1
                }
            }
        ], function(err, m) {
                if (!err) {
                    deferred.resolve(m && m[0]);
                } else {
                    logger.info('Cannot save chat: ', err);
                    deferred.reject(err);
                }
        });
        return deferred.promise;
    },

    findByUsersIds: function(userId1, userId2) {
        var deferred = q.defer();

        ChatService.findByFilter({$and: [ {users: userId1}, {users: userId2 }]})
            .then(function(data) {
                deferred.resolve(data);
            }, function(err) {
                logger.info('Cannot find chat: ', err);
                deferred.reject(err);
            });

        return deferred.promise;
    },

	create: function(userId1, userId2) {
		var chat = new Chat();
		chat.users = [userId1, userId2];
		return this.save(chat);
	},
	
    save: function(chat) {
        var deferred = q.defer();

        chat.save(function (err) {
            if (!err) {
                deferred.resolve(chat.id);
            } else {
                logger.info('Cannot save chat: ', err);
                deferred.reject(err);
            }
        });

        return deferred.promise;
    }
};