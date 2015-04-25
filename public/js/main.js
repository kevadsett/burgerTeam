var debugMode = true;
var socket;
var teammateColour;
var isHosting;
var playerDisconnected = false;
function setStatusText(text) {
    if (game.statusText && game.statusText.exists) {
        console.log("Setting existing text to \"" + text + "\"");
        game.statusText.text = text;
    } else {
        console.log("Creating new text as \"" + text + "\"");
        game.statusText = game.add.text(game.world.width / 2, game.world.height / 2, text);
        game.statusText.anchor.setTo(0.5, 0.5);
    }
}
function setupSocketEvents() {
    socket.on('playerLeft', function onPlayerLeft() {
        game.state.start('disconnected');
    });
    socket.on('gameStarted', function waitForReadyPlayers(colour, hosting) {
        teammateColour = colour;
        isHosting = hosting;
        console.log('Both players in lobby, waiting for ready signals');
        setStatusText('Connecting to other player');
        game.state.start('main');
    });
    socket.on('ingredientsSet', function setIngredientInterface(ingredients) {
        events.emit('ingredientsSet', ingredients);
    });
}
var setup = {
    preload: function() {
        Interface.preload();
        BurgerBit.preload();
        BurgerOrder.preload();
        Plate.preload();
        game.load.image('satisfaction', 'images/satisfaction.png');
        game.load.image('hostGameButton', 'images/host.png');
        game.load.image('joinGameButton', 'images/join.png');
        game.load.image('tryAgainButton', 'images/tryAgain.png');
        game.load.image('playAgainButton', 'images/playAgain.png');
        game.load.image('quitButton', 'images/quit.png');
    },
    create: function() {
        game.stage.backgroundColor = 0xffffff;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setMinMax(0, 0, 1050, 600);

        socket = io();
        setupSocketEvents();

        if (debugMode) {
            teammateColour = 'blue';
            game.state.start('main');
        } else {
            game.state.start('newGame');
        }
    }
};

var newGame = {
    create: function() {
        if (playerDisconnected) {
            playerDisconnected = false;
            setStatusText('Other player was disconnected');
        }
        var hostButton = game.add.button(game.world.width / 2, (game.world.height / 2) - 136, 'hostGameButton', this.onHostGame);
        hostButton.anchor.setTo(0.5, 0.5);
        var joinButton = game.add.button(game.world.width / 2, (game.world.height / 2) + 136, 'joinGameButton', this.onJoinGame);
        joinButton.anchor.setTo(0.5, 0.5);
    },
    onHostGame: function() {
        game.state.start('hostGame');
    },
    onJoinGame: function() {
        game.state.start('joinGame');
    },
};

var joinGame = {
    create: function() {
        var passcode = window.prompt('enter passcode:');
        setStatusText('Please wait, joining game.');
        socket.on('gameReady', function() {
            game.state.start('main');
        });
        socket.on('noGameError', function() {
            setStatusText('No such game');
            var tryAgainButton = game.add.button(game.world.width / 2, (game.world.height / 2) + 136, 'tryAgainButton', onJoinGame);
            tryAgainButton.anchor.setTo(0.5, 0.5);
        });
        socket.emit('joinGame', passcode);
    }
};

var hostGame = {
    create: function() {
        socket.on('passcodeGenerated', function(passcode) {
            setStatusText("Game passcode: " + passcode + "\nGive this code to the second player to begin");
        });
        socket.emit('hostGame');
    }
};

var disconnected = {
    create: function() {
        playerDisconnected = true;
        game.state.start('newGame');
    }
};

var gameOver = {
    create: function() {
        var message = "You're fired!";
        var quitButton = game.add.button(game.world.width / 2, (game.world.height / 2) + 136, 'quitButton', this.onQuit);
            quitButton.anchor.setTo(0.5, 0.5);
        if (isHosting) {
            var playAgainButton = game.add.button(game.world.width / 2, (game.world.height / 2) - 136, 'playAgainButton', this.onPlayAgain);
            playAgainButton.anchor.setTo(0.5, 0.5);
        } else {
            message += "\nWaiting for host.";
        }
        setStatusText(message);
    },
    onPlayAgain: function() {
        socket.emit('playAgain');
    },
    onQuit: function() {
        socket.emit('quit');
        game.state.start('newGame');
    }
};
var main = {
    preload: function() {
        var filename = 'images/' + teammateColour + 'Player.png';
        console.log(filename);
        game.load.spritesheet('teammate', filename, 358, 477);
    },
    create: function() {
        events.off();
        game.speed = 50;
        game.difficulty = 1;
        game.strikes = 0;
        game.orders = [];
        game.plates = [];
        game.burgers = [];
        game.teammate = new Teammate();
        game.satisfaction = 100;
        game.finalX = game.world.width - 100;
        game.CORRECT_REWARD = 5;
        game.INCORRECT_PENALTY = 5;

        game.burgerGroup = game.add.group();
        game.interface = new Interface();

        if (debugMode) {
            events.emit('ingredientsSet', [Burger.BUN_BOTTOM, Burger.PATTY, Burger.LETTUCE, Burger.BUN_TOP]);
            this.addNewOrder();
        }

        console.log("Emitting ready signal");
        if (!debugMode) {
            socket.emit('playerReady');
            socket.on('updateLoop', this.serverUpdate.bind(this));
        }
        events.on('addBit', this.addBit, this);
        events.on('submitOrder', this.submitOrder, this);
        events.on('submitPlate', this.submitPlate, this);
        events.on('markOrder', this.markOrder, this);
        events.on('submitAnimComplete', this.submitPlate, this);
    },
    update: function() {
        var dt = game.time.physicsElapsed;
        var i;
        for (i = 0; i < game.plates.length; i++) {
            game.plates[i].update(dt);
        }
        for (i = 0; i < game.burgers.length; i++) {
            game.burgers[i].update();
        }

        if (game.plates[0] && game.plates[0].position) {
            var newX =  game.plates[0].position.x;
            var nextX = game.plates[0].position.x + (dt * game.plates[0].speed);
            game.interface.updateDispenserPosition(dt, newX, nextX);
        }
        if (!debugMode) {
            game.satisfaction = Math.max(0, game.satisfaction - dt * 5);
        }
        game.interface.updateSatisfaction(game.satisfaction);
    },
    serverUpdate: function(data) {
        if (data.gameOver) {
            return game.state.start('gameOver');
        }
        var i;
        for (i = 0; i < game.plates.length; i++) {
            game.plates[i].position.x = data.platePositions[i].x;
            game.plates[i].position.y = data.platePositions[i].y;
        }
        if (i < data.platePositions.length) {
            while (i < data.platePositions.length) {
                game.plates.push(new Plate(game.speed));
                i++;
            }
        }

        for (i = 0; i < game.orders.length && data.orders[i]; i++) {
            game.orders[i].updateBits(data.orders[i]);
        }
        if (game.orders.length > data.orders.length) {
            game.orders.splice(data.orders.length);
        } else {
            while (i < data.orders.length) {
                game.orders.push(new BurgerOrder(data.orders[i]));
                i++;
            }
        }
        for (i = 0; i < game.burgers.length; i++) {
            game.burgers[i].updateBits(data.burgers[i].bits);
        }
        while (i < data.burgers.length) {
            game.burgers.push(new Burger(game.plates[i].position, i, data.burgers[i].bits));
            i++;
        }
        game.strikes = data.strikes;
        game.speed = data.speed;
        game.satisfaction = data.satisfaction;
    },
    addBit: function(index) {
        game.burgers[game.burgers.length - 1].addBit(index);
        console.log(index);
        if (!debugMode) {
            socket.emit('newBit', index);
        }
    },
    addNewOrder: function() {
        game.orders.push(new BurgerOrder([Burger.BUN_BOTTOM, Burger.PATTY, Burger.LETTUCE, Burger.BUN_TOP]));
        game.plates.push(new Plate(game.speed));
        game.burgers.push(new Burger(game.plates[game.plates.length - 1].position));
    },
    submitOrder: function() {
        if (!debugMode) {
            socket.emit('submitOrder', game.orders[0].specification, game.burgers[0].getSpec());
        }
        game.plates[0].beingSubmitted = true;
        game.interface.playSubmitAnimation();
    },
    submitPlate: function() {
        var firstBurgerOrder = game.orders.shift();
        var frontBurger = game.burgers.shift();
        var frontPlate = game.plates.shift();
        if (firstBurgerOrder.checkBurger(frontBurger)) {
            console.log("You got it right!");
            game.satisfaction = Math.min(100, game.satisfaction + game.CORRECT_REWARD);
        } else {
            console.log("You got it wrong!");
            game.satisfaction = Math.min(100, game.satisfaction - game.INCORRECT_PENALTY);
        }
        frontBurger.destroy();
        firstBurgerOrder.destroy();
        frontPlate.destroy();
        if (debugMode) {
            this.addNewOrder();
        }
    }
};
var game = new Phaser.Game(1050, 600, Phaser.AUTO);
game.state.add('setup', setup);
game.state.start('setup');
game.state.add('hostGame', hostGame);
game.state.add('joinGame', joinGame);
game.state.add('newGame', newGame);
game.state.add('disconnected', disconnected);
game.state.add('main', main);
game.state.add('gameOver', gameOver);