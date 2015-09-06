(function () {
    GLOBAL["config"] =  require('./../config.local.js');
    var models = require('./../api/model');
    var utils = require('./../utils');
    var dbutils = require('./utils');
    var UserService = require('./../api/services/UserService');
    var ChatService = require('./../api/services/UserService');
    var q = require('q');
    var vkApi = require('./../vkApi.js');

    var coords = [27.507375, 53.883873];  //Dziarzhynskogo av.
    var vkIds = [1, 2288280, 17197491, 58513866, 15037767, 14559720, 10249179, 18802294, 26139084, 21162999, 3863981, 6135811, 10846589, 16704573];

    function init() {
        config.dbPopulateInProgress = true;
        models.init();
        dbutils.cleardb()
            .then(function() { return dbutils.saveUsers(vkIds) })
            .then(dbutils.saveChats())
            .then(dbutils.saveMessages)
            .then(function() { return dbutils.addCoordinates(coords) })
            .then(function () {
                config.dbPopulateInProgress = false;
                console.log('Db populated');
                process.exit();
            }, console.log);
    }

    init();
})();

