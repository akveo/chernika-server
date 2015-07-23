var ionicPushServer = require('ionic-push-server');

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
    "payload": {
        "key1": "value",
        "key2": "value"
    }
};


function sendNotification(deviceTokens, message) {
    var notification = {
        "tokens": deviceTokens,
        "notification": {
            "alert": message,
            "ios": iosSettings,
            "android": androidSettings
        }
    };
    ionicPushServer(credentials, notification);
}

module.exports = {
    sendNotification: sendNotification
}

