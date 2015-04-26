var BurgerSpec = require('../modules/burgerSpecification');
var Burger = require('../modules/burger');
var Plate = require('../modules/plate');
var gameLoop = require('node-gameloop');
var gameSize = require('../modules/gameSize');

var LOCATION = "GAME_MANAGER::";

module.exports = function(users, passcode) {
    var SATISFACTION_RATE = 0,
        CORRECT_REWARD = 5,
        INCORRECT_PENALTY = 5,
        INGREDIENT_COUNT = 4;

    var players = {},
        gameOver,
        speed,
        difficulty,
        orders,
        plates,
        burgers,
        satisfaction,
        loop ;

    console.log(LOCATION, "New game with users:", users.length);
    users[0].colour = Math.random > 0.5 ? 'red' : 'blue';
    users[1].colour = users[0].colour === 'red' ? 'blue' : 'red';
    players[users[0].colour] = users[0];
    players[users[1].colour] = users[1];

    players.blue.gameCode = passcode;
    players.red.gameCode = passcode;

    console.log(LOCATION, "Blue player: " + players.blue.id);
    console.log(LOCATION, "Red player: " + players.red.id);
    for (var colour in players) {
        var player = players[colour];
        console.log(LOCATION, "Listening to " + colour + " player (" + player.id + ") for ready event");
        listenToPlayerEvents(player);
    }
    emitGameBegin();

    function emitGameBegin() {
        emitTo('blue', 'gameStarted', { colour: 'blue', isHost: players.blue.isHost});
        emitTo('red', 'gameStarted', { colour: 'red', isHost: players.red.isHost});
    }

    function listenToPlayerEvents(player) {
        player.on('playerReady', onPlayerReady);
        player.on('newBit', onNewBit);
        player.on('submitOrder', onSubmitOrder);
        player.on('playAgain', function() {
            emitGameBegin();
            startGame();
        });
        player.on('quit', destroy);
    }

    function checkAllPlayersReady() {
        var redReady = players.red && players.red.ready;
        var blueReady = players.blue && players.blue.ready;
        return redReady && blueReady;
    }

    function onPlayerReady(playerColour) {
        var player = players[playerColour];
        console.log(LOCATION, playerColour + " player ready (" + player.id + ")");
        player.ready = true;
        if (checkAllPlayersReady()) {
            startGame();
        }
    }

    function startGame() {
        gameOver = false;
        speed = 10;
        difficulty = 1;
        orders = [];
        plates = [];
        burgers = [];
        satisfaction = 100;
        loop = gameLoop.setGameLoop(update, 1000 / 10);
        randomiseIngredients();
        randomiseGoButton();
    }

    function onNewBit(playerColour, type) {
        console.log(LOCATION, playerColour + " added new " + type + " bit.");
        debugPrintPlayers();
        console.log(LOCATION, "addBit", burgers.length, burgers);
        burgers[burgers.length - 1].addBit(type);
        emitTo(playerColour === 'red' ? 'blue' : 'red', 'teammatePressed');
    }

    function onSubmitOrder(playerColour, params) {
        console.log(LOCATION, playerColour + " submitted burger:", params.targetSpec, params.burgerSpec);
        var burgerCorrect = BurgerSpec.checkBurger(params.targetSpec, params.burgerSpec);
        if (burgerCorrect) {
            console.log("You got it right");
            satisfaction = Math.min(100, satisfaction + CORRECT_REWARD);
        } else {
            console.log("You got it wrong");
            satisfaction = Math.max(0, satisfaction - INCORRECT_PENALTY);
        }
        popOrder();
        randomiseIngredients();
        randomiseGoButton();
    }

    function popOrder() {
        burgers.shift();
        orders.shift();
        plates.shift();
    }

    function randomiseIngredients() {
        var blueIngredients = [],
            redIngredients = [];
        for (var i = 0; i < INGREDIENT_COUNT; i++) {
            if (Math.random() > 0.5) {
                blueIngredients.push(i);
            } else {
                redIngredients.push(i);
            }
        }
        debugPrintPlayers();
        emitTo('blue', 'ingredientsSet', blueIngredients);
        emitTo('red', 'ingredientsSet', redIngredients);
    }

    function randomiseGoButton() {
        var blueHasGoButton = (Math.random() < 0.5);
        emitTo('blue', 'showGoButton', blueHasGoButton);
        emitTo('red', 'showGoButton', !blueHasGoButton);
    }

    function update(dt) {
        if (/*Math.random() > 0.99 && */orders.length < 1) {
            newOrder();
        }
        for (var i = 0; i < plates.length; i++) {
            plates[i].update(dt, speed);
        }
        satisfaction = Math.max(0, satisfaction - dt * SATISFACTION_RATE);

        if (satisfaction === 0) {
            gameOver = true;
            gameLoop.clearGameLoop(loop);
        }
        broadcast('updateLoop', {
            orders: orders,
            plates: plates,
            burgers: burgers,
            speed: speed,
            satisfaction: satisfaction,
            gameOver: gameOver
        }, true);
    }

    function broadcast(name, details, hideMessage) {
        if (!hideMessage) {
            debugPrintPlayers();
        }
        for (var colour in players) {
            var player = players[colour];
            if (player) {
                if (!hideMessage) {
                    console.log(LOCATION, "Broadcasting " + name + " to " + colour + " player.\nDetails:", details);
                }
                player.emit(name, details);
            }
        }
    }

    function emitTo(playerColour, name, details) {
        if (players[playerColour]) {
            console.log(LOCATION, "Emitting " + name + " to " + playerColour + " player.\nDetails:", details);
            players[playerColour].emit(name, details);
        }
    }

    function newOrder() {
        var order = BurgerSpec.create(difficulty);
        orders.push(order);
        console.log(LOCATION, "New burger order: " + order);
        plates.push(new Plate());
        burgers.push(new Burger());
    }

    function destroy(playerWhoLeft) {
        console.log(LOCATION, playerWhoLeft.colour + " player left. Destroying game in room '" + playerWhoLeft.gameCode + "'");
        gameLoop.clearGameLoop(loop);
        players[playerWhoLeft.colour] = null;
        broadcast('playerLeft');
    }

    this.destroy = destroy;

    function debugPrintPlayers() {
        console.log("blue: " + !!players.blue, "red: " + !!players.red);
    }
};