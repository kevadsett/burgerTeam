var Game = require('../modules/game');

var LOCATION = "GAME_MANAGER::";

var games = {};

module.exports = {
    create: function(players, lobbyName) {
        games[lobbyName] = new Game(players, gameIndex);
    },
    destroy: function(lobbyName) {
        var game = games[lobbyName];
        game.destroy();
        delete games[lobbyName];
    }
};