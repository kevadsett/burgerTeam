var GameManager = require('../modules/gameManager');

var lobbyIndex = 0;
var Lobby = function(user) {
    this.users = [];
    this.index = lobbyIndex++;
    this.addUser(user);
    this.index = lobbyIndex++;
};

var lobbyIndex = 0;
var userLobbyLookup = {};
var io;

Lobby.prototype = {
    addUser: function(user) {
        console.log("Adding " + user.colour + " user " + user.id + " to lobby " + this.index + ".");
        userLobbyLookup[user.id] = this;
        this.users.push(user);
        user.emit('enterLobby', this.index, user.colour);
        if (this.isFull()) {
            console.log("Lobby " + this.index + " is ready to start");
            GameManager.create(this.users);
            for (var i = 0; i < this.users.length; i++) {
                this.users[i].emit('lobbyReady', this.index, user.id);
            }
            for (var i = 0; i < this.users.length; i++) {
                this.users[i].emit('lobbyFull', this.index);
            }
        } else {
            user.emit('enterLobby', this.users.length, this.index);
        }
    },
    removeUser: function(user) {
        console.log("Remove " + user.id + " from lobby " + this.index);
        this.printUsers();
        delete userLobbyLookup[user.id];
        var userIndex = this.users.indexOf(user);
        if (userIndex > -1) {
            this.users.splice(userIndex, 1);
            if (this.users.length) {
                this.users[0].emit('playerLeft', this.index);
            }
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
        console.log("Current users: " + currentUsers);
    }
};

module.exports = {
    lobbies: [],
    createLobby: function(user) {
        console.log("-----Creating lobby for user: " + user.id + "-----");
        user.colour = 'blue';
        this.lobbies.push(new Lobby(user));
    },
    connect: function(user) {
        console.log("\n\nA new user: " + user.id + " has appeared.");
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
        console.log("User " + user.id + " disconnected from lobby " + lobby.index);
        lobby.printUsers();
        if (user.game) {
            user.game.destroy(user);
        }
        lobby.removeUser(user);
        if (lobby.users.length === 0) {
            var lobbyIndex = this.lobbies.indexOf(lobby);
            if (lobbyIndex > -1) {
                this.lobbies.splice(lobbyIndex, 1);
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