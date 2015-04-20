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
        game.load.spritesheet('buttons', 'images/buttons.png', 210, 175);
        game.load.spritesheet('burger', 'images/burger.png', 256, 32);
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

        game.state.start('newGame');
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
        console.log(game.statusText);
        game.speed = 10;
        game.difficulty = 1;
        game.strikes = 0;
        game.orders = [];
        game.platePositions = [];
        game.burgers = [];
        game.satisfaction = 100;

        game.teammate = new Teammate();

        game.interface = new Interface();

        console.log("Emitting ready signal");
        socket.emit('playerReady');
        socket.on('updateLoop', this.serverUpdate.bind(this));
        events.on('addBit', this.addBit, this);
        events.on('submitOrder', this.submitOrder, this);
    },
    update: function() {
        var dt = game.time.physicsElapsed;
        for (var i = 0; i < game.burgers.length; i++) {
            game.burgers[i].update(dt, game.speed);
        }
        game.satisfaction = Math.max(0, game.satisfaction - dt * 5);
        game.interface.updateSatisfaction(game.satisfaction);
    },
    serverUpdate: function(data) {
        if (data.gameOver) {
            return game.state.start('gameOver');
        }
        var i;
        for (i = 0; i < game.platePositions.length; i++) {
            game.platePositions[i].x = data.platePositions[i].x;
            game.platePositions[i].y = data.platePositions[i].y;
        }
        if (i < data.platePositions.length) {
            while (i < data.platePositions.length) {
                game.platePositions.push({
                    x: data.platePositions[i].x,
                    y: data.platePositions[i].y
                });
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
            game.burgers.push(new Burger(game.platePositions[i], i, data.burgers[i].bits));
            i++;
        }
        game.strikes = data.strikes;
        game.speed = data.speed;
        game.satisfaction = data.satisfaction;
    },
    addBit: function(index) {
        game.burgers[game.burgers.length - 1].addBit(index);
        console.log(index);
        socket.emit('newBit', index);
    },
    addNewOrder: function() {
        game.orders.push(new BurgerOrder(game.difficulty));
        game.platePositions.push({
            x: 0,
            y: game.world.height / 2
        });
        game.burgers.push(new Burger(game.platePositions[game.platePositions.length - 1]));
    },
    submitOrder: function() {
        var firstBurgerOrder = game.orders.shift();
        var frontBurger = game.burgers.shift();
        console.log("Submitting order", firstBurgerOrder.specification, frontBurger.getSpec());
        socket.emit('submitOrder', firstBurgerOrder.specification, frontBurger.getSpec());
        if (firstBurgerOrder.checkBurger(frontBurger)) {
            console.log("You got it right!");
            game.satisfaction = Math.min(100, game.satisfaction + 5);
        } else {
            console.log("You got it wrong!");
            if (game.strikes === 3) {
                console.log("Game over");
                game.paused = true;
            } else {
                game.satisfaction -= 5;
                game.strikes++;
            }
        }
        frontBurger.destroy();
        firstBurgerOrder.destroy();
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