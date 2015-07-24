var ionicPushServer = require('ionic-push-server'); //TODO: Stop using this package (easy to implement)
var _ = require('underscore');

var credentials = {
    IonicApplicationID : config.ionic.appId,
    IonicApplicationAPIsecret : config.ionic.apiSecret
};

var iosSettings = {
    "badge": 1,
    "sound": "ping.aiff",
    "expiry": 1423238641,
    "priority": 10,
    "contentAvailable": true
};

var androidSettings = {
    "collapseKey": "foo",
    "delayWhileIdle": true,
    "timeToLive": 300,
    "title": 'pinder'
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
            var android = _.extend({}, androidSettings, {message: message, title: title});
            var notification = {
                "tokens": deviceTokens,
                "notification": {
                    "alert": message,
                    "ios": iosSettings,
                    "android": android
                }
            };
            ionicPushServer(credentials, notification);
        })
}

module.exports = {
    sendNotification: sendNotification
};

