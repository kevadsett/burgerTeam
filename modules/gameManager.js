var BurgerSpec = require('../modules/burgerSpecification');

var io;
var games = [];
var gameIndex = 0;

var Game = function(players) {
    this.difficulty = 1;
    this.players = players;
    this.readyPlayers = {
        red: false,
        blue: false
    };
    this.orders = [];
    this.index = gameIndex++;
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        this.readyPlayers[player.colour] = false;
        player.game = this;
        console.log("Listening to " + player.colour + " player (" + player.id + ") for ready event");
        player.on('playerReady', this.onPlayerReady.bind(this, player));
    }
};

Game.prototype = {
    onPlayerReady: function(player) {
        console.log(player.colour + " player ready (" + player.id + ")");
        this.readyPlayers[player.colour] = true;
        var allReady = true;
        for (var key in this.readyPlayers) {
            if (!this.readyPlayers[key]) {
                allReady = false;
            }
        }
        if (allReady) {
            this.newOrder();
        }
    },
    broadcast: function(name, details) {
        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            console.log("Emitting to " + player.colour + " player: ", details);
            this.players[i].emit(name, details);
        }
    },
    newOrder: function() {
        var newOrder = new BurgerSpec(this.difficulty);
        this.orders.push(newOrder);
        console.log("New burger order: " + newOrder.target);
        this.broadcast('newOrder', newOrder.target);
    },
    destroy: function(playerWhoLeft) {
        console.log("Player " + playerWhoLeft.id + " left. Destroying game " + this.index);
        var playerIndex = this.players.indexOf(playerWhoLeft);
        this.players.splice(playerIndex);
    }
};

module.exports = {
    setIo: function(socketIo) {
        io = socketIo;
    },
    create: function(players) {
        games.push(new Game(players));
    },
    destroy: function(gameIndex) {
        var game = games[gameIndex];
        game.destroy();
        games.splice(gameIndex, 1);
    }
};