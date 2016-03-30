(function () {
  GLOBAL["config"] = require('./../config.local.js');
  var logger = require('../logger').create();
  GLOBAL['logger'] = logger;
  var models = require('./../api/model');
  var utils = require('./../utils');
  var SuggestService = require('./../api/services/SuggestService');
  var UserService = require('./../api/services/UserService');

  var q = require('q');

  models.init();

  var messages = [
    {
      sender: undefined,
      chat: undefined,
      text: 'Привет, у тебя красивые фотки!',
      wasRead: false
    },
    {
      sender: undefined,
      chat: undefined,
      text: 'У тебя тоже)',
      wasRead: false
    },
    {
      sender: undefined,
      chat: undefined,
      text: 'Не хочешь встретиться?',
      wasRead: true
    },
    {
      sender: undefined,
      chat: undefined,
      text: 'Давай)',
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

  function saveUsers(vkIds) {
    var userIds = [];
    var deferred = q.defer();

    vkIds.forEach(function (vkId) {
      UserService.login(vkId)
        .then(function (userId) {
          userIds.push(userId);
          console.log('user saved');
          if (userIds.length == vkIds.length) {
            console.log('users resolved');
          }
          userIds.length == vkIds.length && deferred.resolve(userIds);
        });
    });

    setTimeout(function () {
      deferred.resolve(userIds)
    }, 60000);
    return deferred.promise;
  }

  function saveChats(userIds) {
    var savePromises = [];

    var chats = [];
    userIds.forEach(function (uId, index) {
      if (index != 0) {
        var chat = {
          users: [userIds[index].id, userIds[index - 1].id]
        };
        chats.push(chat);
      }
    });
    chats.forEach(function (chat, index) {
      var chatModel = new Chat();
      chatModel.users = chat.users;
      SuggestService.dislike(chat.users[0], chat.users[1]);
      SuggestService.dislike(chat.users[1], chat.users[0]);
      savePromises.push(modelSavePromise(chatModel))
    });

    console.log('chats saved');

    return q.all(savePromises);
  }

  function saveMessages(chats) {
    var savePromises = [];

    chats.forEach(function (chat, cIndex) {
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

    console.log('messages saved');

    return q.all(savePromises);
  }

  function addCoordinates(coordsArr) {
    var deferred = q.defer();

    User.find(function (err, users) {
      var savePromises = [];
      users.forEach(function (u) {
        u.lastKnownPosition.coordinates = getRandomCoordinatesPair(coordsArr);
        savePromises.push(modelSavePromise(u));
      });
      q.all(savePromises)
        .then(function () {
          deferred.resolve();
        })
    });

    console.log('coordinates added');

    return deferred.promise;
  }


  function modelSavePromise(model) {
    var deferred = q.defer();

    model.save(function (err) {
      if (err) {
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
      if (err) {
        console.log(err);
        deferred.reject(err);
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  }

  function getRandomCoordinatesPair(coordsArray) {
    return coordsArray[Math.floor(Math.random() * coordsArray.length)];
  }

  module.exports = {
    saveUsers: saveUsers,
    saveChats: saveChats,
    saveMessages: saveMessages,
    addCoordinates: addCoordinates,
    cleardb: cleardb
  }

})();
