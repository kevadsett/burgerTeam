var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var LobbyManager = require('./modules/lobbyManager2');

var LOCATION = 'APP::';

// LobbyManager.setIo(io);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
    LobbyManager.connect(socket);
    socket.on('disconnect', function() {
        LobbyManager.disconnect(socket);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});