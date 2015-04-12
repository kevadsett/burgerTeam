var GameManager = require('../modules/gameManager');
var LOCATION = "LOBBY::";

var lobbyIndex = 0;
var Lobby = function(user) {
    this.users = [];
    this.index = lobbyIndex++;
    this.addUser(user);
};

var userLobbyLookup = {};
var io;

Lobby.prototype = {
    addUser: function(user) {
        console.log(LOCATION, "Adding " + user.colour + " user " + user.id + " to lobby " + this.index + ".");
        userLobbyLookup[user.id] = this;
        this.users.push(user);
        user.emit('enterLobby', this.index, user.colour);
        if (this.isFull()) {
            console.log(LOCATION, "Lobby " + this.index + " is ready to start");
            GameManager.create(this.users);
            for (var i = 0; i < this.users.length; i++) {
                this.users[i].emit('lobbyReady', this.index, user.id);
            }
            for (var i = 0; i < this.users.length; i++) {
                this.users[i].emit('lobbyFull', this.index);
            }
        }
    },
    removeUser: function(user) {
        console.log(LOCATION, "Remove " + user.id + " from lobby " + this.index);
        this.printUsers();
        delete userLobbyLookup[user.id];
        var userIndex = this.users.indexOf(user);
        if (userIndex > -1) {
            this.users.splice(userIndex, 1);
        }
        if (this.users.length) {
            this.users[0].emit('playerLeft', this.index);
        }
    },
    isFull: function() {
        return this.users.length === 2;
    },
    printUsers: function() {
        var currentUsers = [];
        for (var i = 0; i < this.users.length; i++) {
            currentUsers.push(this.users[i].id);
        }
        console.log(LOCATION, "Current users: " + currentUsers);
    }
};

module.exports = {
    lobbies: [],
    createLobby: function(user) {
        console.log(LOCATION, "-----Creating lobby for user: " + user.id + "-----");
        user.colour = 'blue';
        this.lobbies.push(new Lobby(user));
    },
    connect: function(user) {
        if (this.lobbies.length) {
            var latestLobby = this.lobbies[this.lobbies.length - 1];
            if (latestLobby.isFull()) {
                this.createLobby(user);
            } else {
                user.colour = 'red';
                latestLobby.addUser(user);
            }
        } else {
            this.createLobby(user);
        }
    },
    disconnect: function(user) {
        var lobby = userLobbyLookup[user.id];
        console.log(LOCATION, "User " + user.id + " disconnected from lobby " + lobby.index);
        lobby.printUsers();
        if (user.game) {
            user.game.destroy(user);
        }
        lobby.removeUser(user);
        if (lobby.users.length === 0) {
            var lobbyPosition = this.lobbies.indexOf(lobby);
            if (lobbyPosition > -1) {
                console.log(LOCATION, "Lobby " + lobby.index + " is empty. Getting rid.");
                this.lobbies.splice(lobbyPosition, 1);
                lobbyIndex--;
                console.log(LOCATION, this.lobbies.length + " lobbies still in play");
            }
        }
    },
    setIo: function(socketIo) {
        io = socketIo;
        GameManager.setIo(socketIo);
    },
    setIo: function(socketIo) {
        io = socketIo;
    }
};