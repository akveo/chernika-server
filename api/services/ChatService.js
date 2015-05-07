
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
                logger.info('Cannot save message: Chat not found');
                deferred.reject('Cannot save message: Chat not found');
            }
        }, function(err) {
            logger.info('Cannot save message: ', err);
            deferred.reject(err);
        });
    },

    findByUsersIds: function(id1, id2) {
        return ChatService.findByFilter( {users: {$all: [
            {$elemMatch: {id: id1}}, {$elemMatch: {id: id2}}
        ]}});
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