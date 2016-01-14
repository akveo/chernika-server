(function () {
    var q = require('q');
    var dbutils = require('./utils');
    var _ = require('underscore');
    var vkApi = require('../vkApi');

    var coords = [[27.567498, 53.921208], [27.507375, 53.883873], [27.496352, 53.909187], [ 27.438099, 53.907139], [27.535942, 53.952062], [27.549954, 53.895944], [27.666141, 53.939026], [27.553462, 53.905629], [27.571699, 53.857087], [27.577219, 53.930715]];
    var cities = [1135212, 1, 2, 314]; //Minsk, Moscow, SPB, Kiev
    var token = '51e76cd1db07dd9e8e5a1fda814f31d7682ad6fda48bdfd71f417ebd2b18a9d5ad3108395888387f395c4';
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
            .then(function () {
              return q.all([
                  vkApi.request('users.search', {city: cities[0], age_from: 18, status: 6, count: 300, access_token: token}),
                  vkApi.request('users.search', {city: cities[1], age_from: 18, status: 6, count: 300, access_token: token}),
                  vkApi.request('users.search', {city: cities[2], age_from: 18, status: 6, count: 300, access_token: token}),
                  vkApi.request('users.search', {city: cities[3], age_from: 18, status: 6, count: 300, access_token: token})
              ]);
          })
            .spread(function (usersMinsk, usersMoscow, usersSPB , usersKiev ) {
                var users = [].concat(usersMinsk.items, usersMoscow.items, usersSPB.items, usersKiev.items);
                users = _.shuffle(users);
                console.log(usersMinsk.items.length, usersMoscow.items.length, usersSPB.items.length,usersKiev.items.length);
		console.log(users.length, 'users retrieved');
                vkIds = _.map(users, function (user) { return user.id; })
            })
            .then(function () { return addUsersPack(vkIds.splice(0, packSize)) }, console.log);
    }

    init();
})();


