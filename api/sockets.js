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
