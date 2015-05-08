
var q = require('q');

module.exports = {

    find: function(id) {
        return this.findByFilter({ id: id });
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

    addMessage: function(receiverId, message) {
        var deferred = q.defer();
        this.findByUsersIds(receiverId, message.sender.id).then(function(chat) {
            if (chat) {
                chat.messages.push(message);
                deffered.resolve(message);
            } else {
                logger.info('Cannot add message: Chat not found');
                deferred.reject('Cannot add message: Chat not found');
            }
        }, function(err) {
            logger.info('Cannot add message: ', err);
            deferred.reject(err);
        });
    },

    findByUsersIds: function(userId1, userId2) {
        var deferred = q.defer();

        User.find({$or: [{id:userId1}, {id:userId2}]}, {_id: 1}, function(err, users) {
            if (users && users.length == 2) {
                var objIds = users.map(function(user) { return user._id; });
                ChatService.findByFilter({$and: [ {users: objIds[0]}, {users: objIds[1]} ]})
                    .then(function(data) {
                        deferred.resolve(data);
                    }, function(err) {
                        logger.info('Cannot find chat: ', err);
                        deferred.reject(err);
                    });
            } else {
                logger.info('Cannot find chat: chat users not found');
                deferred.reject('Cannot find chat: chat users not found');
            }

        });

        return deferred.promise;
    },

    save: function(chat) {
        var deferred = q.defer();

        chat.populate('users', function(err, chat) {
            if (err) {
                logger.info('Cannot save chat: ', err);
                deferred.reject(err);
            } else {
                MatchService.areUsersMatched(chat.users[0].id, chat.users[1].id).then(function(areMatched) {
                    if (areMatched === true) {
                        _saveChat();
                    } else {
                        logger.info('Cannot save chat: users not matched');
                        deferred.reject('Cannot save chat: users not matched');
                    }
                }, function(err) {
                    logger.info('Cannot save chat: ', err);
                    deferred.reject(err);
                })
            }
        });

        function _saveChat() {
            chat.save(function (err) {
                if (!err) {
                    deferred.resolve(chat.id);
                } else {
                    logger.info('Cannot save chat: ', err);
                    deferred.reject(err);
                }
            });
        }

        return deferred.promise;
    }
};