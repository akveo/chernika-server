(function () {
    GLOBAL["config"] =  require('./config.local');
    var models = require('./api/model');
    var utils = require('./utils');
    var UserService = require('./api/services/UserService');
    var ChatService = require('./api/services/UserService');
    var q = require('q');

    var users = [
        {
            bdate: '10.10.1984',
            sex: 2,
            firstName: 'Павел',
            vkId: 1,
            photo:
            { src: 'http://cs540108.vk.me/c7003/v7003978/1ed9/yoeGXOWmW-M.jpg',
                width: 731,
                height: 1000,
                crop: { width: 731, x: 0, height: 0, y: 500 } },
            settings:
            { enableFriends: true,
                distance: 100,
                minAge: 18,
                maxAge: 34,
                show: 1 },
            lastKnownPosition: {}
        },
        {
            bdate: '13.11.1994',
            sex: 2,
            firstName: 'Андрей',
            vkId: 17197491,
            photo:
            { src: 'http://cs403620.vk.me/v403620491/8a2b/st6iwD2rYOI.jpg',
                width: 765,
                height: 1024,
                crop: { width: 765, x: 0, height: 0, y: 512 } },
            settings:
            { enableFriends: true,
                distance: 100,
                minAge: 18,
                maxAge: 34,
                show: 1 },
            lastKnownPosition: {}
        },
        {
            bdate: '4.11.1990',
            sex: 2,
            firstName: 'Владимир',
            vkId: 2288280,
            photo:
            { src: 'http://cs614720.vk.me/v614720280/e299/Cl7gO4PQ5KI.jpg',
                width: 671,
                height: 1024,
                crop: { width: 671, x: 0, height: 0, y: 512 } },
            settings:
            { enableFriends: true,
                distance: 100,
                minAge: 18,
                maxAge: 34,
                show: 1 },
            lastKnownPosition: {}
        }
    ];

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
        User.remove(function(err) {
            err && console.log(err);
        });
        Message.remove(function (err) {
            err && console.log(err);
        });
        Chat.remove(function (err) {
            err && console.log(err);
        });
        Match.remove(function (err) {
            err && console.log(err);
        });
    }

    function saveUsers() {
        var userIds = [];
        var deferred = q.defer();

        users.forEach(function (user) {
            var userModel = new User(user);
            userModel.save(function (err, um) {
                if (err) {
                    deferred.reject(err);
                } else {
                    userIds.push(um._id);
                    userIds.length == users.length && deferred.resolve(userIds);
                }
            });
        });

        return deferred.promise;
    }

    function saveChats(userIds) {
        var deferred = q.defer();

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
            chatModel.save(function(err, cm) {
                if (err) {
                    deferred.reject(err);
                } else {
                    chats[index] = cm;
                    index == chats.length - 1 && deferred.resolve(chats);
                }
            })
        });

        return deferred.promise;
    }

    function saveMessages(chats) {
        var deferred = q.defer();

        chats.forEach(function(chat, cIndex) {
            messages.forEach(function (message, mIndex) {
                var messageModel = new Message({
                    sender: mIndex % 2 == 0 ? chat.users[0] : chat.users[1],
                    chat: chat._id,
                    created: message.created,
                    text: message.text,
                    wasRead: message.wasRead
                });
                messageModel.save(function(err, mm) {
                    if (err) {
                        deferred.reject(err)
                    } else {
                        cIndex == chats.length - 1 && mIndex == messages.length - 1 && deferred.resolve(messages);
                    }
                })
            });
        });

        return deferred.promise;
    }


    function init() {
        models.init();
        clear();
        console.log('Db cleared');
        saveUsers()
            .then(saveChats)
            .then(saveMessages)
            .then(function () {
                console.log('Db populated');
                process.exit();
            }, console.log);
    }

    init();
})();

