var Lobby = function(user) {
    this.users = [];
    this.addUser(user);
    this.index = lobbyIndex++;
};

var lobbyIndex = 0;
var userLobbyLookup = {};
var io;

Lobby.prototype = {
    addUser: function(user) {
        console.log("Adding user " + user.id + " to lobby " + this.index + ".");
        userLobbyLookup[user.id] = this;
        this.users.push(user);
        if (this.isFull()) {
            console.log("Full lobby, let's get started!");
            for (var i = 0; i < this.users.length; i++) {
                this.users[i].emit('lobbyFull', this.index);
            }
        } else {
            user.emit('enterLobby', this.users.length, this.index);
        }
    },
    removeUser: function(user) {
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
    }
};

module.exports = {
    lobbies: [],
    createLobby: function(user) {
        console.log("Creating lobby for user: " + user.id);
        this.lobbies.push(new Lobby(user));
    },
    connect: function(user) {
        console.log("A new user: " + user.id);
        if (this.lobbies.length) {
            var latestLobby = this.lobbies[this.lobbies.length - 1];
            if (latestLobby.isFull()) {
                this.createLobby(user);
            } else {
                latestLobby.addUser(user);
            }
        } else {
            this.createLobby(user);
        }
    },
    disconnect: function(user) {
        var lobby = userLobbyLookup[user.id];
        lobby.removeUser(user);
        return lobby;
    },
    setIo: function(socketIo) {
        io = socketIo;
    }
};