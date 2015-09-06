(function() {
  GLOBAL["config"] =  require('./../config.local.js');
  var models = require('./../api/model');
  var utils = require('./../utils');
  var UserService = require('./../api/services/UserService');
  var ChatService = require('./../api/services/UserService');
  var q = require('q');
  var vkApi = require('./../vkApi.js');

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

  function cleardb() {
    return q.all([
      modelRemovePromise(User),
      modelRemovePromise(Message),
      modelRemovePromise(Chat),
      modelRemovePromise(Match)
    ]);
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

  function saveUsers(vkIds) {
    var userIds = [];
    var deferred = q.defer();

    vkIds.forEach(function (vkId) {
      UserService.login(vkId)
        .then(function (userId) {
          userIds.push(userId);
          console.log('user saved');
          if (userIds.length == users.length) {
            console.log('users resolved');
          }
          userIds.length == vkIds.length && deferred.resolve(userIds);
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
          created: new Date(),
          text: message.text,
          wasRead: message.wasRead
        });
        savePromises.push(modelSavePromise(messageModel));
      });
    });

    return q.all(savePromises);
  }

  function addCoordinates(coords) {
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

  module.exports = {
    saveUsers: saveUsers,
    saveChats: saveChats,
    saveMessages: saveMessages,
    addCoordinates: addCoordinates,
    cleardb: cleardb
  }

})
