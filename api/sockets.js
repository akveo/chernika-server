var io = require('socket.io');
var AuthPolicy = require('./policies/AuthPolicy.js');
var restify = require('restify');

module.exports = {
    init: function(server) {
        io = io(server);

        ioFilterHelper(io, socketToRestifyReqPatcher);
        ioFilterHelper(io, restify.fullResponse());
        ioFilterHelper(io, restify.bodyParser());
        ioFilterHelper(io, restify.queryParser());
        ioFilterHelper(io, AuthPolicy.checkSession);
        io.on('connection', function(socket) {
            socket.userId = socket.request.params.userId;
            socket.join('messages_' + socket.userId);

            socket.on('new_message', function(message) {
                if (checkMatch(message, socket.userId)) {
                    io.sockets.in('messages_' + message.recepientId).emit('new_message', message);
                    io.sockets.in('messages_' + message.userId).emit('new_message', message);
                    saveMessage(message);
                } else {
                    throwDumbError()
                }
            });

            socket.on('disconnect', function() {
                socket.leave('messages_' + socket.userId);
                console.log('user disconnected');
            });

            console.log('a user connected');
        });
    }
};


function ioFilterHelper(io, filter) {
    if (filter.constructor === Array) {
        filter.forEach(function(filterItem) {
            ioFilterHelper(io, filterItem);
        })
    } else {
        io.use(function(socket, next) {
            filter(socket.request, socket.request.res, next)
        });
    }
}

function socketToRestifyReqPatcher(req, res, next) {
    req.params = req.params || {};
    return next();
}

function saveMessage() {

}

function checkMatch(message, userId) {
    return true;
}

function throwDumbError() {
    throw new Error('Dumb error');
}
