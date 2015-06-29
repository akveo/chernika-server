(function () {
    GLOBAL["config"] =  require('./config.local');
    var models = require('./api/model');
    var utils = require('./utils');
    var UserService = require('./api/services/UserService');
    var ChatService = require('./api/services/UserService');
    var q = require('q');
    var vkApi = require('./vkApi.js');

    var coords = [27.507375, 53.883873];  //Dziarzhynskogo av.
    var users = [1, 2288280, 17197491, 58513866, 15037767, 14559720, 10249179, 18802294, 26139084, 21162999, 3863981, 6135811, 10846589, 16704573];
    var messages = [
        {
            sender:  undefined,
            chat:  undefined,
            text: 'Фраза девушки, которая уложила весь автосервис: - "Я когда даю в зад, у меня не горит лампочка". Ответная фраза приемщика, от которой все полегли на месте: - "Понятно, а с машиной то что?" ',
            created: new Date(),
            wasRead: false
        },
        {
            sender:  undefined,
            chat:  undefined,
            text: 'Мужик приходит к врачу, снимает штаны, а там член 1 см, врач задумчиво:\n-жалуетесь?\n-нет бл...дь хвастаюсь!',
            created: new Date(),
            wasRead: false
        },
        {
            sender:  undefined,
            chat:  undefined,
            text: '- Изя, у вас чай есть?\n Нет.\n- А кофе?\n-Чай есть.',
            created: new Date(),
            wasRead: true
        },
        {
            sender:  undefined,
            chat:  undefined,
            text: 'Мама говорит Наташе Ростовой:\n- Наташа, что такое, вы женаты с поручиком уже пятый год, а у вас все еще нет детей?\n- Мама! Что вы?! Чтобы я глотала эту гадость?!',
            created: new Date(),
            wasRead: true
        }
    ];


    function clear() {
        return q.all([
            modelRemovePromise(User),
            modelRemovePromise(Message),
            modelRemovePromise(Chat),
            modelRemovePromise(Match)
        ]);
    }

    function saveUsers() {
        var userIds = [];
        var deferred = q.defer();

        users.forEach(function (vkId) {
            UserService.login(vkId)
                .then(function (userId) {
                    userIds.push(userId);
                    console.log('user saved');
                    if (userIds.length == users.length) {
                        console.log('users resolved');
                    }
                    userIds.length == users.length && deferred.resolve(userIds);
                });
        });

        return deferred.promise;
    }

    function saveChats(userIds) {
        var savePromises = [];

        var chats = [];
        userIds.forEach(function(uId, index) {
            if (index != 0) {
                var chat = {
                    users: [userIds[index], userIds[index - 1]]
                };
                chats.push(chat);
            }
        });
        chats.forEach(function (chat, index) {
            var chatModel = new Chat(chat);
            savePromises.push(modelSavePromise(chatModel))
        });

        return q.all(savePromises);
    }

    function saveMessages(chats) {
        var savePromises = [];

        chats.forEach(function(chat, cIndex) {
            messages.forEach(function (message, mIndex) {
                var messageModel = new Message({
                    sender: mIndex % 2 == 0 ? chat.users[0] : chat.users[1],
                    chat: chat._id,
                    created: message.created,
                    text: message.text,
                    wasRead: message.wasRead
                });
                savePromises.push(modelSavePromise(messageModel));
            });
        });

        return q.all(savePromises);
    }

    function modelRemovePromise(model) {
        var deferred = q.defer();

        model.remove(function (err) {
            if(err) {
                console.log(err);
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    }

    function addCoordinates() {
        var deferred = q.defer();

        User.find(function (err, users) {
            var savePromises = [];
            users.forEach(function (u) {
                u.lastKnownPosition.coordinates = coords;
                savePromises.push(modelSavePromise(u));
            });
            q.all(savePromises)
                .then(function () {
                    deferred.resolve();
                })
        });

        return deferred.promise;
    }


    function modelSavePromise(model) {
        var deferred = q.defer();

        model.save(function (err) {
            if(err) {
                console.log(err);
                deferred.reject(err);
            } else {
                deferred.resolve(model);
            }
        });

        return deferred.promise;
    }


    function init() {
        config.dbPopulateInProgress = true;
        models.init();
        clear()
            .then(saveUsers)
            .then(saveChats)
            .then(saveMessages)
            .then(addCoordinates)
            .then(function () {
                config.dbPopulateInProgress = false;
                console.log('Db populated');
                process.exit();
            }, console.log);
    }

    init();
})();

