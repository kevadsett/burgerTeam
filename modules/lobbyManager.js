var Lobby = function(user) {
    this.users = [];
    this.addUser(user);
};

var userLobbyLookup = {};

Lobby.prototype = {
    addUser: function(user) {
        userLobbyLookup[user.id] = this;
        this.users.push(user);
        if (this.isFull()) {
            console.log("Full lobby, let's get started!");
        }
    },
    removeUser: function(user) {
        delete userLobbyLookup[user.id];
        var userIndex = this.users.indexOf(user);
        if (userIndex > -1) {
            this.users.splice(userIndex, 1);
        }
    },
    isFull: function() {
        return this.users.length === 2;
    }
};

module.exports = {
    lobbies: [],
    createLobby: function(user) {
        this.lobbies.push(new Lobby(user));
    },
    connect: function(user) {
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
    }
};