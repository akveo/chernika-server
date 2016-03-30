var io = require('socket.io');
var AuthPolicy = require('./policies/AuthPolicy.js');
var mongoose = require('mongoose');
var push = require('./pushNotification');

module.exports = {
  init: function (server) {
    io = io(server);

    io.on('connection', function (socket) {
      if (!config.withoutPolicy) {
        initializeUnauthorizedSocket(socket);
      } else {
        initializeAuthorizedSocket(socket)
      }

    });
  }
};

function initializeUnauthorizedSocket(socket) {

  socket.emit('authorize');
  attachSafely(socket, 'authorize', onAuthorize);

  function onAuthorize(encryptedToken) {
    socket.userId = AuthPolicy._getTokenId(encryptedToken);
    if (socket.userId) {
      initializeAuthorizedSocket(socket);
    } else {
      socket.emit('socket_error', {msg: 'Access not permitted', type: 'AuthError'});
    }
  }
}

function initializeAuthorizedSocket(socket) {

  joinChatRooms(socket);

  attachSafely(socket, 'new_message', onNewMessage);
  attachSafely(socket, 'message_read', onMessageRead);
  attachSafely(socket, 'join_chat', joinChatRoom);

  function onNewMessage(data) {
    var messageDocument = new Message(data.message);
    ChatService.addMessage(messageDocument).then(function (msg) {
      messageDocument = msg;
      io.to('chat_' + messageDocument.chat).emit('new_message', messageDocument);
      push.sendNotification(data.receiver, messageDocument.text, data.senderName);
    });
  }

  function onMessageRead(message) {
    ChatService.markMessageRead(message._id).then(function (updatedMessage) {
      io.to('chat_' + updatedMessage.chat).emit('message_read', updatedMessage);
    });
  }

  function joinChatRoom(chatId) {
    socket.join('chat_' + chatId);
  }
}

function joinChatRooms(socket) {
  ChatService.findChats(socket.userId)
    .then(function (chats) {
      chats.forEach(function (chat) {
        socket.join('chat_' + chat.id);
      });
    });
}

function attachSafely(socket, name, func) {
  if (!socket._events || !socket._events[name]) {
    socket.on(name, func);
  }
}
