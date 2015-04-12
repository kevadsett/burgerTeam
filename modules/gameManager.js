var BurgerSpec = require('../modules/burgerSpecification');
var Burger = require('../modules/burger');
var gameLoop = require('node-gameLoop');

var LOCATION = "GAME_MANAGER::";

var io;
var games = [];
var gameIndex = 0;
var gameSize = {
    width: 1050,
    height: 600
};

var Game = function(players) {
    this.difficulty = 1;
    this.players = players;
    this.readyPlayers = {
        red: false,
        blue: false
    };
    this.index = gameIndex++;
    console.log(LOCATION, "Starting a game " + this.index);
    this.broadcast('gameStarted');
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        this.readyPlayers[player.colour] = false;
        player.game = this;
        console.log(LOCATION, "Listening to " + player.colour + " player (" + player.id + ") for ready event");
        this.listenToPlayerEvents(player);
    }
};

Game.prototype = {
    listenToPlayerEvents: function(player) {
        player.on('playerReady', this.onPlayerReady.bind(this, player));
        player.on('newBit', this.onNewBit.bind(this));
    },
    onPlayerReady: function(player) {
        console.log(LOCATION, player.colour + " player ready (" + player.id + ")");
        this.readyPlayers[player.colour] = true;
        var allReady = true;
        for (var key in this.readyPlayers) {
            if (!this.readyPlayers[key]) {
                allReady = false;
            }
        }
        if (allReady) {
            this.startGame();
        }
    },
    startGame: function() {
        this.speed = 10;
        this.difficulty = 1;
        this.strikes = 0;
        this.orders = [];
        this.platePositions = [];
        this.burgers = [];
        this.loop = gameLoop.setGameLoop(this.update.bind(this), 1000 / 10);
    },
    onNewBit: function(type) {
        console.log(LOCATION, "Adding new " + type + " bit.");
        this.burgers[this.burgers.length - 1].addBit(type);
    },
    update: function(dt) {
        if (/*Math.random() > 0.99 && */this.orders.length < 1) {
            this.newOrder();
        }
        for (var i = 0; i < this.burgers.length; i++) {
            this.burgers[i].update(dt, this.speed);
        }
        this.broadcast('updateLoop', {
            orders: this.orders,
            platePositions: this.platePositions,
            burgers: this.burgers,
            speed: this.speed,
            difficulty: this.difficulty
        }, true);
    },
    broadcast: function(name, details, hideMessage) {
        if (!hideMessage) {
            console.log(LOCATION, "Emitting" + name + " to players");
        }
        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            this.players[i].emit(name, details);
        }
    },
    newOrder: function() {
        var newOrder = new BurgerSpec(this.difficulty);
        this.orders.push(newOrder);
        console.log(LOCATION, "New burger order: " + newOrder.target);
        this.platePositions.push({
            x: 0,
            y: gameSize.height / 2
        });
        this.burgers.push(new Burger(this.platePositions[0], this.platePositions.length - 1));
    },
    destroy: function(playerWhoLeft) {
        console.log(LOCATION, playerWhoLeft.colour + " player left. Destroying game " + this.index);
        gameLoop.clearGameLoop(this.loop);
        var playerIndex = this.players.indexOf(playerWhoLeft);
        this.players.splice(playerIndex);
        this.broadcast('playerLeft');
        gameIndex--;
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