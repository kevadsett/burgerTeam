var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var LobbyManager = require('./modules/lobbyManager');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
	LobbyManager.connect(socket);
	console.log("A user connected");
	socket.on('disconnect', function() {
		LobbyManager.disconnect(socket);
		console.log("User disconnected");
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});