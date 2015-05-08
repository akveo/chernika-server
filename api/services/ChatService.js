
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

    findByUsersIds: function(id1, id2) {
        var deferred = q.defer();

        User.find({$or: [{id:id1}, {id:id2}]}, {_id: 1}, function(err, docs) {
            if (docs && docs.length == 2) {
                var objIds = docs.map(function(doc) { return doc._id; });
                ChatService.findByFilter({$and: [ {users: objIds[0]}, {users: objIds[1]} ]})
                    .then(function(data) {
                        deferred.resolve(data);
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