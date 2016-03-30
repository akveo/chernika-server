var _ = require('underscore');
var http = require('http');
var querystring = require('querystring');

var ionicPushServer = function (credentials, notification) {

  var postData = querystring.stringify(notification);

  var options = {
    hostname: 'push.ionic.io',
    port: 80,
    path: '/api/v1/push',
    method: 'POST',
    headers: {
      "Authorization": "Basic " + new Buffer(credentials.IonicApplicationAPIsecret + ":").toString("base64"),
      "Content-Type": "application/json",
      "X-Ionic-Application-Id": credentials.IonicApplicationID
    }
  };

  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
  });

  req.on('error', function (e) {
    logger.error('Push error: %s', e.toString());
  });

  req.write(JSON.stringify(notification));
  req.end();

};

var credentials = {
  IonicApplicationID: config.ionic.appId,
  IonicApplicationAPIsecret: config.ionic.apiSecret
};

var iosSettings = {
  "badge": 1,
  "sound": "ping.aiff",
  "expiry": 1423238641,
  "priority": 10,
  "contentAvailable": true,
  "payload": {
    "key1": "value",
    "key2": "value"
  }
};

var androidSettings = {
  "collapseKey": "foo",
  "delayWhileIdle": true,
  "timeToLive": 300
};

function getUserDevices(id) {
  return UserService.find(id)
    .then(function (u) {
      return u.devices.map(function (d) {
        return d.token;
      });
    })
}

function sendNotification(id, message, title) {
  return getUserDevices(id)
    .then(function (deviceTokens) {
      var android = _.extend({}, androidSettings, {alert: message, title: title ? title : 'chernika'});
      var ios = _.extend({}, iosSettings, {alert: title ? title + ': ' + message : message});
      var notification = {
        "tokens": deviceTokens,
        "notification": {
          "ios": ios,
          "android": android
        }
      };
      ionicPushServer(credentials, notification);
    })
}

module.exports = {
  sendNotification: sendNotification
};

