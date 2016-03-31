var q = require('q');
var Push = require('../Push');

module.exports = {

  findByGeo: function (userId, lon, lat) {
    lon = parseFloat(lon);
    lat = parseFloat(lat);
    return UserService.update(userId, {
        lastKnownPosition: {type: 'Point', coordinates: [lon, lat]},
        lastActivity: new Date()
      })
      .then(SuggestService._getFindByGeoParams)
      .then(SuggestService._findByGeo);
  },

  _getFindByGeoParams: function (user) {
    var params = {
      maxDistance: user.settings.distance || 100,
      sex: user.settings.show ? [user.settings.show] : [1, 2],
      minAge: user.settings.minAge,
      maxAge: user.settings.maxAge,
      position: user.lastKnownPosition
    };
    return this.getLikedUsers(user._id)
      .then(function (uIds) {
        uIds.push(user._id);
        params.likedUsers = uIds;
        return params;
      });
  },

  _findByGeo: function (params) {
    var deferred = q.defer();
    User.geoNear(params.position, {
      maxDistance: params.maxDistance * 1000,
      spherical: true,
      limit: config.geoNearLimit,
      query: {
        _id: {$nin: params.likedUsers},
        sex: {$in: params.sex},
        age: {
          $gte: params.minAge,
          $lte: params.maxAge
        }
      }
    }, function (err, users) {
      deferred.resolve(users)
    });
    return deferred.promise;
  },

  getLikedUsers: function (userId) {
    var deferred = q.defer();
    Match.find({user: userId}, function (err, matches) {
      var userIds = matches.map(function (m) {
        return m.target;
      });
      deferred.resolve(userIds);
    });
    return deferred.promise;
  },

  report: function (userId, targetId) {
    var report = new Report();
    report.user = userId;
    report.target = targetId;
    var deferred = q.defer();
    report.save(function (err) {
      if (!err) {
        deferred.resolve(report._id);
      } else {
        logger.info('Cannot save report: ', err);
        deferred.reject(err);
      }
    });
    return deferred.promise;
  },

  block: function (userId, targetId) {
    return ChatService.blockChat(userId, targetId);
  },

  dislike: function (userId, targetId) {
    var match = new Match();
    match.user = userId;
    match.target = targetId;
    match.like = false;

    return this.createMatch(match);
  },

  like: function (userId, targetId) {
    var match = new Match();
    match.user = userId;
    match.target = targetId;
    match.like = true;

    this.createMatch(match);
    return this.isOppositeMatched(userId, targetId)
      .then(function (isMatched) {
        if (isMatched) {
          ChatService.create(userId, targetId)
            .then(function () {
              Push.sendNotification(userId, 'Новая пара!');
              Push.sendNotification(targetId, 'Новая пара!');
            });
        }
        return !!isMatched;
      });
  },

  isOppositeMatched: function (userId, targetId) {
    var deferred = q.defer();
    Match.findOne({user: targetId, target: userId}, function (err, oppositeMatch) {
      deferred.resolve(oppositeMatch && oppositeMatch.like);
      if (err) {
        logger.info('Cannot return user.');
        deferred.reject(err);
      }
    });
    return deferred.promise;
  },

  createMatch: function (match) {
    var deferred = q.defer();
    match.save(function (err) {
      if (!err) {
        deferred.resolve(match._id);
      } else {
        logger.info('Cannot save match: ', err);
        deferred.reject(err);
      }
    });
    return deferred.promise;
  }
};
