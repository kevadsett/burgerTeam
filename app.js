var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var LobbyManager = require('./modules/lobbyManager2');

var LOCATION = 'APP::';

var BurgerSpec = require('./modules/burgerSpecification');

// LobbyManager.setIo(io);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
    console.log("----- USER CONNECTED: " + socket.id + " -----");
    LobbyManager.connect(socket);
    socket.on('disconnect', function() {
        console.log("----- USER DISCONNECTED: " + socket.id + " -----");
        LobbyManager.disconnect(socket);
    });
});

http.listen(process.env.PORT || 5000, function() {
    console.log('listening on ' + (process.env.PORT || 5000));
});
