var Passcode = require('../modules/passcode');
var GameManager = require('../modules/gameManager');
var LOCATION = "LOBBY::";

var users = {};
var hosts = {};
var games = {};

function hostGame(user) {
    user.isHost = true;
    var gamePasscode = Passcode.generate();
    hosts[gamePasscode] = user;
    user.emit('passcodeGenerated', gamePasscode);
}

function joinGame(user, passcode) {
    console.log(LOCATION, "Join game: " + passcode);
    if (hosts[passcode]) {
        user.isHost = false;
        games[passcode] = GameManager.create([hosts[passcode], user]);
    } else {
        user.emit('noGameError');
    }
}

module.exports = {
    connect: function(user) {
        users[user.id] = user;
        user.on('hostGame', hostGame.bind(this, user));
        user.on('joinGame', joinGame.bind(this, user));
    },
    disconnect: function(user) {
        delete users[user.id];
        if (user.game) {
            user.game.destroy(user);
        }
    }
};