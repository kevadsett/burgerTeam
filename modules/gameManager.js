var BurgerSpec = require('../modules/burgerSpecification');
var Burger = require('../modules/burger');
var gameLoop = require('node-gameloop');

var LOCATION = "GAME_MANAGER::";

var io;
var games = [];
var gameIndex = 0;
var gameSize = {
    width: 1050,
    height: 600
};

var SATISFACTION_RATE = 0,
    CORRECT_REWARD = 5,
    INCORRECT_PENALTY = 5,
    INGREDIENT_COUNT = 4;

var Game = function(players) {
    players[0].colour = Math.random > 0.5 ? 'red' : 'blue';
    players[1].colour = players[0].colour === 'red' ? 'blue' : 'red';
    this.players = {};
    this.players[players[0].colour] = players[0];
    this.players[players[1].colour] = players[1];
    this.readyPlayers = {
        red: false,
        blue: false
    };
    this.index = gameIndex++;
    console.log(LOCATION, "Starting a game " + this.index);
    console.log(LOCATION, "Blue player: " + this.players.blue.id);
    console.log(LOCATION, "Red player: " + this.players.red.id);
    for (var colour in this.players) {
        var player = this.players[colour];
        this.readyPlayers[colour] = false;
        player.game = this;
        console.log(LOCATION, "Listening to " + colour + " player (" + player.id + ") for ready event");
        this.listenToPlayerEvents(player);
    }
    this.emitGameBegin();
};

Game.prototype = {
    emitGameBegin: function() {
        this.players.blue.emit('gameStarted', 'red', this.players.blue.isHost);
        this.players.red.emit('gameStarted', 'blue', this.players.red.isHost);
    },
    listenToPlayerEvents: function(player) {
        player.on('playerReady', this.onPlayerReady.bind(this, player));
        player.on('newBit', this.onNewBit.bind(this, player));
        player.on('submitOrder', this.onSubmitOrder.bind(this));
        player.on('playAgain', function() {
            this.emitGameBegin();
            this.startGame();
        }.bind(this));
        player.on('quit', this.destroy.bind(this, player));
    },
    checkAllPlayersReady: function() {
        var redReady = this.players.red && this.players.red.ready;
        var blueReady = this.players.blue && this.players.blue.ready;
        return redReady && blueReady;
    },
    onPlayerReady: function(player) {
        console.log(LOCATION, player.colour + " player ready (" + player.id + ")");
        player.ready = true;
        console.log(player.colour + ":", !!player);
        if (this.checkAllPlayersReady()) {
            this.startGame();
        }
    },
    startGame: function() {
        this.gameOver = false;
        this.speed = 50;
        this.difficulty = 1;
        this.orders = [];
        this.platePositions = [];
        this.burgers = [];
        this.satisfaction = 100;
        this.loop = gameLoop.setGameLoop(this.update.bind(this), 1000 / 10);
        this.randomiseIngredients();
    },
    onNewBit: function(player, type) {
        console.log(LOCATION, "Adding new " + type + " bit.");
        console.log("blue: " + !!this.players.blue, "red: " + !!this.players.red);
        this.burgers[this.burgers.length - 1].addBit(type);
        this.players[player.colour === 'red' ? 'blue' : 'red'].emit('teammatePressed');
    },
    onSubmitOrder: function(spec, burger) {
        console.log(LOCATION, "Burger submitted:", spec, burger);
        var burgerCorrect = BurgerSpec.checkBurger(spec, burger);
        if (burgerCorrect) {
            console.log("You got it right");
            this.satisfaction = Math.min(100, this.satisfaction + CORRECT_REWARD);
        } else {
            console.log("You got it wrong");
            this.satisfaction = Math.max(0, this.satisfaction - INCORRECT_PENALTY);
        }
        this.popOrder();
        this.randomiseIngredients();
    },
    popOrder: function() {
        this.burgers.shift();
        this.orders.shift();
        this.platePositions.shift();
    },
    randomiseIngredients: function() {
        var blueIngredients = [],
            redIngredients = [];
        for (var i = 0; i < INGREDIENT_COUNT; i++) {
            if (Math.random() > 0.5) {
                blueIngredients.push(i);
            } else {
                redIngredients.push(i);
            }
        }
        this.players.blue.emit('ingredientsSet', blueIngredients);
        this.players.red.emit('ingredientsSet', redIngredients);
    },
    update: function(dt) {
        console.log("blue: " + !!this.players.blue, "red: " + !!this.players.red);
        if (/*Math.random() > 0.99 && */this.orders.length < 1) {
            this.newOrder();
        }
        for (var i = 0; i < this.burgers.length; i++) {
            this.burgers[i].update(dt, this.speed);
        }
        this.satisfaction = Math.max(0, this.satisfaction - dt * SATISFACTION_RATE);

        if (this.satisfaction === 0) {
            this.gameOver = true;
            gameLoop.clearGameLoop(this.loop);
        }
        this.broadcast('updateLoop', {
            orders: this.orders,
            platePositions: this.platePositions,
            burgers: this.burgers,
            speed: this.speed,
            satisfaction: this.satisfaction,
            gameOver: this.gameOver
        }, true);
    },
    broadcast: function(name, details, hideMessage) {
        if (!hideMessage) {
            console.log(LOCATION, "Emitting " + name + " to players");
        }
        for (var colour in this.players) {
            var player = this.players[colour];
            if (player) {
                player.emit(name, details);
            }
        }
    },
    newOrder: function() {
        var newOrder = BurgerSpec.create(this.difficulty);
        this.orders.push(newOrder);
        console.log(LOCATION, "New burger order: " + newOrder);
        this.platePositions.push({
            x: 0,
            y: gameSize.height / 2
        });
        this.burgers.push(new Burger(this.platePositions[0], this.platePositions.length - 1));
    },
    destroy: function(playerWhoLeft) {
        console.log(LOCATION, playerWhoLeft.colour + " player left. Destroying game " + this.index);
        gameLoop.clearGameLoop(this.loop);
        this.players[playerWhoLeft.colour] = null;
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