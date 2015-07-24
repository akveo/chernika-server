var io = require('socket.io');
var AuthPolicy = require('./policies/AuthPolicy.js');
var mongoose = require('mongoose');
var Push = require('./Push');

module.exports = {
    init: function(server) {
        io = io(server);

        io.on('connection', function(socket) {
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
    socket.on('authorize', onAuthorize);

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

    socket.on('new_message', onNewMessage);
    socket.on('messages_during_interval', onMessagesDurinInterval);
    socket.on('message_read', onMessageRead);

    function onNewMessage(data) {
        var messageDocument = new Message(data.message);
        ChatService.addMessage(messageDocument).then(function () {
            io.to('chat_' + messageDocument.chat).emit('new_message', messageDocument);
            Push.sendNotification(data.receiver, {
                message: messageDocument.text,
                title: 'Новое сообщение'
            });
        });
    }

    function onMessagesDurinInterval(req) {
        var until = req.until ? new Date(req.until) : new Date();
        var from = new Date(req.from);
        var chatId = mongoose.Types.ObjectId(req.chat);
        ChatService.getMessagesDuringInterval(chatId, from, until)
            .then(function(messages) {
                socket.emit('messages_during_interval', messages);
            });
    }

    function onMessageRead(message) {
        ChatService.markMessageRead(message._id).then(function (updatedMessage) {
            io.to('chat_' + updatedMessage.chat).emit('message_read', updatedMessage);
        });
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
