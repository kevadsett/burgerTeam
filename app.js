var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var LobbyManager = require('./modules/lobbyManager');

var LOCATION = 'APP::';

LobbyManager.setIo(io);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
    console.log("\n\n" + LOCATION, "A new user has appeared!", socket.id);
    LobbyManager.connect(socket);
    socket.on('disconnect', function() {
        console.log("\n\n" + LOCATION, "User disconnected:", socket.id);
        LobbyManager.disconnect(socket);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});