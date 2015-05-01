var debugMode = false;
var SATISFACTION_RATE = 0.5,
    CORRECT_REWARD = 5,
    INCORRECT_PENALTY = 5,
    INGREDIENT_COUNT = 12;
var socket;
var myColour;
var teammateNumber;
var isHosting;
var playerDisconnected = false;
function setStatusText(text) {
    if (game.statusText && game.statusText.exists) {
        console.log("Setting existing text to \"" + text + "\"");
        game.statusText.text = text;
    } else {
        console.log("Creating new text as \"" + text + "\"");
        game.statusText = game.add.text(game.world.width / 2, 490, text, {fill: '#fff'});
        game.statusText.anchor.setTo(0.5, 0.5);
    }
}
function setupSocketEvents() {
    socket.on('playerLeft', function onPlayerLeft() {
        game.state.start('disconnected');
    });
    socket.on('gameStarted', function waitForReadyPlayers(details) {
        myColour = details.colour;
        teammateNumber = myColour === 'red' ? 1 : 2;
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
        // game.load.image('satisfaction', 'images/satisfaction.png');
        game.load.spritesheet('hostGameButton', 'images/hostbtn.png', 216, 127);
        game.load.spritesheet('joinGameButton', 'images/joinbtn.png', 216, 127);
        game.load.spritesheet('playAgainButton', 'images/playagainbtn.png', 216, 127);
        game.load.image('home', 'images/homebg.png');
        // game.load.spritesheet('quitButton', 'images/quitbtn.png');
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
            teammateNumber = 2;
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
        teammateNumber = null;
        if (playerDisconnected) {
            playerDisconnected = false;
            setStatusText('Other player was disconnected');
        }
        var bg = game.add.sprite(0, 0, 'home');
        bg.height = 600;
        var hostButton = game.add.button((game.world.width / 2) - 200, 500, 'hostGameButton', this.onHostGame, 1, 1, 0, 1);
        hostButton.anchor.setTo(0.5, 0.5);
        var joinButton = game.add.button((game.world.width / 2) + 200, 500, 'joinGameButton', this.onJoinGame, 1, 1, 0, 1);
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
        var bg = game.add.sprite(0, 0, 'home');
        bg.height = 600;
        var passcode = window.prompt('enter passcode:');
        setStatusText('Please wait, joining game.');
        events.on('gameReady', function() {
            game.state.start('main');
        });
        events.on('noGameError', function() {
            setStatusText('No such game');
            // var tryAgainButton = game.add.button(game.world.width / 2, (game.world.height / 2) + 136, 'tryAgainButton', function() {
                // game.state.start('newGame');
            // }, 1, 1, 0, 1);
            // tryAgainButton.anchor.setTo(0.5, 0.5);
        });
        emit('joinGame', passcode);
    }
};

var hostGame = {
    create: function() {
        var bg = game.add.sprite(0, 0, 'home');
        bg.height = 600;
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
        var bg = game.add.sprite(0, 0, 'home');
        bg.height = 600;
        var message = "You're fired!";
        // var quitButton = game.add.button((game.world.width / 2) + 200, 500, 'quitButton', this.onQuit, 1, 1, 0, 1);
            // quitButton.anchor.setTo(0.5, 0.5);
        if (isHosting) {
            var playAgainButton = game.add.button((game.world.width / 2) - 200, 500, 'playAgainButton', this.onPlayAgain, 1, 1, 0, 1);
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
        var filename = 'images/player' + teammateNumber + '.png';
        console.log(filename);
        game.load.spritesheet('teammate', filename, 320, 272);
    },
    create: function() {
        game.speed = 10;
        game.difficulty = 1;
        game.strikes = 0;
        game.orders = [];
        game.plates = [];
        game.burgers = [];
        game.satisfaction = 100;
        game.finalX = game.world.width - 100;

        game.interface = new Interface();
        game.teammate = new Teammate();
        game.plateGroup = game.add.group();
        game.burgersGroup = game.add.group();
        game.dispenserGroup = game.add.group();
        game.dispenserGroup.add(game.interface.dispenser.sprite);
        game.ordersGroup = game.add.group();

        if (debugMode) {
            events.emit('ingredientsSet', [0,1,2,3,4,5,6,7,11]);
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
            nextX = game.plates[0].position.x + (dt * game.speed);
        }
        game.interface.updateDispenserPosition(dt, newX, nextX);
        game.satisfaction = Math.max(0, game.satisfaction - dt * SATISFACTION_RATE);
        if (debugMode) {
            this.timer++;
            if (!(this.timer % 1000)) {
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
        if (data.burgerResult === 'incorrect' && !game.interface.showingDent) {
            game.interface.showSatisfactionDent(INCORRECT_PENALTY);
        }
        var i;
        for (i = 0; i < data.plates.length; i++) {
            if (game.plates[i]) {
                game.plates[i].position.x = data.plates[i].position.x;
                game.plates[i].position.y = data.plates[i].position.y;
            } else {
                game.plates.push(new Plate());
            }
        }

        for (i = 0; i < data.orders.length; i++) {
            if (game.orders[i]) {
                if (!game.plates[i].beingSubmitted && JSON.stringify(game.orders[i].specification) !== JSON.stringify(data.orders[i])) {
                    game.orders[i].updateBits(data.orders[i]);
                }
            } else {
                game.orders.push(new BurgerOrder(data.orders[i]));
            }
        }

        for (i = 0; i < data.burgers.length; i++) {
            if (game.burgers[i]) {
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
            } else {
                game.burgers.push(new Burger(game.plates[i].position, data.burgers[i].specification));
            }
        }
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
        var newOrder = [Burger.BUN_BOTTOM];
        var orderLength = Math.ceil(Math.random() * 6);
        for (var i = 0; i < orderLength; i++) {
            newOrder.push(Math.floor(Math.random() * 10) + 1);
        }
        newOrder.push(Burger.BUN_TOP);
        game.orders.push(new BurgerOrder(newOrder));
        game.plates.push(new Plate());
        game.burgers.push(new Burger(game.plates[game.plates.length - 1].position));
    },
    submitOrder: function() {
        if (!game.orders[0]) return;
        if (!debugMode) {
            emit('submitOrder', {
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
            // game.satisfaction = Math.min(100, game.satisfaction + CORRECT_REWARD);
        } else {
            console.log("You got it wrong!");
            // game.satisfaction = Math.min(100, game.satisfaction - INCORRECT_PENALTY);
            if (!game.interface.showingDent) {
                game.interface.showSatisfactionDent(INCORRECT_PENALTY);
            }
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