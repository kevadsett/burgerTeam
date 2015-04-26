var debugMode = false;
var SATISFACTION_RATE = 0,
    CORRECT_REWARD = 5,
    INCORRECT_PENALTY = 5;
var socket;
var myColour;
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
    socket.on('gameStarted', function waitForReadyPlayers(details) {
        myColour = details.colour;
        teammateColour = myColour === 'red' ? 'blue' : 'red';
        isHosting = details.isHost;
        console.log('Both players in lobby, waiting for ready signals');
        setStatusText('Connecting to other player');
        game.state.start('main');
    });
    socket.on('ingredientsSet', function setIngredientInterface(ingredients) {
        events.emit('ingredientsSet', ingredients);
    });
    if (!debugMode) {
        socket.on('updateLoop', function(data) {
            events.emit('serverUpdate', data);
        });
    }
    socket.on('gameReady', function() {
        events.emit('gameReady');
    });
    socket.on('noGameError', function() {
        events.emit('noGameError');
    });
    socket.on('passcodeGenerated', function(passcode) {
        events.emit('passcodeGenerated', passcode);
    });
    socket.on('showGoButton', function(show) {
        events.emit('showGoButton', show);
    });
}

function emit(name, details) {
    socket.emit(name, myColour || socket.id, details);
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
        events.off();
        myColour = null;
        teammateColour = null;
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
        events.on('gameReady', function() {
            game.state.start('main');
        });
        events.on('noGameError', function() {
            setStatusText('No such game');
            var tryAgainButton = game.add.button(game.world.width / 2, (game.world.height / 2) + 136, 'tryAgainButton', function() {
                game.state.start('newGame');
            });
            tryAgainButton.anchor.setTo(0.5, 0.5);
        });
        emit('joinGame', passcode);
    }
};

var hostGame = {
    create: function() {
        events.on('passcodeGenerated', function(passcode) {
            setStatusText("Game passcode: " + passcode + "\nGive this code to the second player to begin");
        });
        emit('hostGame');
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
        events.off();
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
        emit('playAgain');
    },
    onQuit: function() {
        emit('quit');
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
        game.speed = 10;
        game.difficulty = 1;
        game.strikes = 0;
        game.orders = [];
        game.plates = [];
        game.burgers = [];
        game.teammate = new Teammate();
        game.satisfaction = 100;
        game.finalX = game.world.width - 100;

        game.ordersGroup = game.add.group();
        game.burgersGroup = game.add.group();
        game.interface = new Interface();

        if (debugMode) {
            events.emit('ingredientsSet', [Burger.BUN_BOTTOM, Burger.PATTY, Burger.LETTUCE, Burger.BUN_TOP]);
            this.addNewOrder();
        }

        console.log("Emitting ready signal");
        if (!debugMode) {
            emit('playerReady');
            events.on('serverUpdate', this.serverUpdate, this);
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

        var newX = 0, nextX = 0;
        if (game.plates[0] && game.plates[0].position) {
            newX =  game.plates[0].position.x;
            nextX = game.plates[0].position.x + (dt * game.plates[0].speed);
        }
        game.interface.updateDispenserPosition(dt, newX, nextX);
        if (!debugMode) {
            game.satisfaction = Math.max(0, game.satisfaction - dt * SATISFACTION_RATE);
        } else {
            this.timer++;
            if (!(this.timer % 600)) {
                this.addNewOrder();
            }
        }
        game.interface.updateSatisfaction(game.satisfaction);
    },
    timer: 0,
    serverUpdate: function(data) {
        if (data.gameOver) {
            return game.state.start('gameOver');
        }
        var i;
        for (i = 0; i < game.plates.length; i++) {
            game.plates[i].position.x = data.plates[i].position.x;
            game.plates[i].position.y = data.plates[i].position.y;
        }
        if (i < data.plates.length) {
            while (i < data.plates.length) {
                game.plates.push(new Plate());
                i++;
            }
        }

        for (i = 0; i < game.orders.length; i++) {
            if (!game.plates[i].beingSubmitted && JSON.stringify(game.orders[i].specification) !== JSON.stringify(data.orders[i])) {
                game.orders[i].updateBits(data.orders[i]);
            }
        }
        if (game.orders.length > data.orders.length) {
            var deletedOrders = game.orders.splice(data.orders.length);
            for (var j = 0; j < deletedOrders.length; j++) {
                deletedOrders[j].destroy();
            }
        } else {
            while (i < data.orders.length) {
                game.orders.push(new BurgerOrder(data.orders[i]));
                i++;
            }
        }
        for (i = 0; i < game.burgers.length; i++) {
            var gameBurger = game.burgers[i],
                burgerSpec = gameBurger.specification,
                serverSpec = data.burgers[i].specification;
            if (JSON.stringify(burgerSpec) !== JSON.stringify(serverSpec)) {
                if (burgerSpec.length > serverSpec.length) {
                    gameBurger.replaceBits(serverSpec);
                } else {
                    gameBurger.addNewBits(serverSpec);
                }
            }
        }
        while (i < data.burgers.length) {
            game.burgers.push(new Burger(game.plates[i].position, data.burgers[i].specification));
            i++;
        }
        game.strikes = data.strikes;
        game.speed = data.speed;
        game.satisfaction = data.satisfaction;
    },
    addBit: function(type) {
        game.burgers[0].addBit(type);
        console.log(type);
        if (!debugMode) {
            emit('newBit', type);
        }
    },
    addNewOrder: function() {
        game.orders.push(new BurgerOrder([Burger.BUN_BOTTOM, Burger.PATTY, Burger.LETTUCE, Burger.BUN_TOP]));
        game.plates.push(new Plate());
        game.burgers.push(new Burger(game.plates[game.plates.length - 1].position));
    },
    submitOrder: function() {
        if (!game.orders[0]) return;
        if (!debugMode) {
            emit('submitOrder', {
                // TODO: Shouldn't need targetSpec here
                targetSpec: game.orders[0].specification,
                burgerSpec: game.burgers[0].specification
            });
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
            game.satisfaction = Math.min(100, game.satisfaction + CORRECT_REWARD);
        } else {
            console.log("You got it wrong!");
            game.satisfaction = Math.min(100, game.satisfaction - INCORRECT_PENALTY);
        }
        frontBurger.destroy();
        firstBurgerOrder.destroy();
        frontPlate.destroy();
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