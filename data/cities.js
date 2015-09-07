(function () {
    var dbutils = require('./utils');
    var _ = require('underscore');
    var vkApi = require('../vkApi');

    var coords = [27.507375, 53.883873];  //Dziarzhynskogo av.
    var cityId = 1135212; //Minsk
    var token = 'b35adbda25e9982d2d4c5cdde60cc880474f8aac3211406d8463609a62941a75fc0fd57afef3f26642747';
    var packSize = 10;
    var vkIds;


    function addUsersPack(ids) {
        config.dbPopulateInProgress = true;
        return dbutils.saveUsers(ids)
            .then(function() { return dbutils.addCoordinates(coords) })
            .then(function () {
                config.dbPopulateInProgress = false;
                console.log('Pack saved, remaining', vkIds.length);
                vkIds.length ? process.exit() : addUsersPack(vkIds.splice(0, packSize));
            }, console.log)
    }

    function init() {
        vkApi.init()
            .then(dbutils.cleardb)
            .then(function () { return vkApi.request('users.search', {city: cityId, age_from: 18, count: 1000, access_token: token}); })
            .then(function (users) {
                console.log(users.items.length, 'users retrieved');
                vkIds = _.map(users.items, function (user) { return user.id; })
            })
            .then(function () { return addUsersPack(vkIds.splice(0, packSize)) });
    }

    init();
})();

