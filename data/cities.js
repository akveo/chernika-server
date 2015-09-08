(function () {
    var dbutils = require('./utils');
    var _ = require('underscore');
    var vkApi = require('../vkApi');

    var coords = [[27.567498, 53.921208], [27.507375, 53.883873], [27.496352, 53.909187], [ 27.438099, 53.907139], [27.535942, 53.952062], [27.549954, 53.895944], [27.666141, 53.939026], [27.553462, 53.905629], [27.571699, 53.857087], [27.577219, 53.930715]];
    var cityId = 1135212; //Minsk
    var token = '7a15e822a7f56029659ec083c6063e92a7ec794e9ebdbb501219f96448c347445893adf6fb3152fe5aab8';
    var packSize = 10;
    var vkIds;


    function addUsersPack(ids) {
        config.dbPopulateInProgress = true;
        return dbutils.saveUsers(ids)
            .then(function() { return dbutils.addCoordinates(coords) })
            .then(function () {
                config.dbPopulateInProgress = false;
                console.log('Pack saved, remaining', vkIds.length);
                vkIds.length ? addUsersPack(vkIds.splice(0, packSize)) : process.exit();
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
            .then(function () { return addUsersPack(vkIds.splice(0, packSize)) }, console.log);
    }

    init();
})();

