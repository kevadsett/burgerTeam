var Passcode = require('../modules/passcode');
var Game = require('../modules/game');
var LOCATION = "LOBBY::";

var users = {};
var hosts = {};
var games = {};

function hostGame(userId) {
    var user = users[userId];
    user.isHost = true;
    var gamePasscode = Passcode.generate();
    hosts[gamePasscode] = user;
    console.log(LOCATION, userId + " generated '" + gamePasscode + "' lobby.");
    user.emit('passcodeGenerated', gamePasscode);
}

function joinGame(userId, passcode) {
    var user = users[userId];
    console.log(LOCATION, userId + " is joining game: " + passcode);
    if (hosts[passcode]) {
        user.isHost = false;
        games[passcode] = new Game([hosts[passcode], user], passcode);
    } else {
        user.emit('noGameError');
    }
}

module.exports = {
    connect: function(user) {
        users[user.id] = user;
        user.on('hostGame', hostGame);
        user.on('joinGame', joinGame);
    },
    disconnect: function(user) {
        delete users[user.id];
        if (user.gameCode) {
            games[user.gameCode].destroy(user);
        }
    }
};