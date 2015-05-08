var q = require('q');

module.exports = {

   usersMatches: function(userId1, userId2) {
        var deferred = q.defer();

        User.find({$or: [{id:userId1}, {id:userId2}]}, {_id: 1}, function(err, users) {
            if (users && users.length == 2) {
                var objIds = users.map(function(user) { return user._id; });
                Match.find({$or: [ {user: objIds[0], target: objIds[1] }, {user: objIds[1], target: objIds[0] } ]},
                function(err, matches) {
                    if (err) {
                        logger.info('Cannot find match: '. err);
                        deferred.reject(err);
                    } else {
                        deferred.resolve(matches);
                    }
                });
            } else {
                logger.info('Cannot find match: match users not found');
                deferred.reject('Cannot find match: match users not found');
            }

        });

        return deferred.promise;
    },

    areUsersMatched: function(userId1, userId2) {
        var deferred = q.defer();

        this.usersMatches(userId1, userId2).then(function(matches) {
            if (matches && matches.length == 2) {
                var areMatched = matches[0].like && matches[1].like;
                deferred.resolve(areMatched);
            } else {
                logger.info('Cannot detect if users are matched: match users not found');
                deferred.reject('Cannot detect if users are matched: match users not found');
            }
        }, function(err) {
            logger.info('Cannot detect if users are matched: ', err);
            deferred.reject(err);
        });

        return deferred.promise;
    }
};