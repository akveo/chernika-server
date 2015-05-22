var io = require('socket.io');
var AuthPolicy = require('./policies/AuthPolicy.js');
var restify = require('restify');
var mongoose = require('mongoose');

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

    socket.on('authorize', onAuthorize);

    function onAuthorize(encryptedToken) {
        socket.userId = AuthPolicy._getTokenId(encryptedToken);
        if (socket.userId) {
            initializeAuthorizedSocket(socket);
        } else {
            socket.emit('socket_error', {msg: 'Access not permitted', type: 'AuthError'});
            socket.disconnect()
        }
    }
}

function initializeAuthorizedSocket(socket) {

    joinChatRooms(socket);

    socket.on('chats_info', onChatsInfo);
    socket.on('new_message', onNewMessage);
    socket.on('messages_during_interval', onMessagesDurinInterval);

    function onChatsInfo() {
        ChatService.getChatsInfo(socket.userId)
            .then(function (chatsInfo) {
                socket.emit('chats_info', chatsInfo);
            })
    }

    function onNewMessage(message) {
        var messageDocument = new Message(message);
        ChatService.addMessage(messageDocument).then(function () {
            io.to('chat_' + message.chat).emit('new_message', message);
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
}

function joinChatRooms(socket) {
    ChatService.findChats(socket.userId)
        .then(function (chats) {
            chats.forEach(function (chat) {
                socket.join('chat_' + chat.id);
            });
        });
}
