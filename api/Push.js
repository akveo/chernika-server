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
    "contentAvailable": true,
    "payload": {
        "key1": "value",
        "key2": "value"
    }
};

var androidSettings = {
    "collapseKey": "foo",
    "delayWhileIdle": true,
    "timeToLive": 300,
    "title": 'Pinder'
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
            var android = title ? _.extend({}, androidSettings, {title: title}) : androidSettings;
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

