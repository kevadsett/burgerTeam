var socket;
var clientColour;
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
    socket.on('enterLobby', function onEnterLobby(lobbyId, playerColour) {
        console.log("Entering lobby " + lobbyId + ". You are the " + playerColour + " player.");
        clientColour = playerColour;
        game.state.start('waiting');
    });
    socket.on('lobbyReady', function onLobbyReady(lobbyId) {
        console.log("Lobby " + lobbyId + " is ready, starting main state.");
        game.state.start('main');
    });
    socket.on('playerLeft', function onPlayerLeft(lobbyId) {
        console.log("Player left lobby " + lobbyId + ", changing to 'waiting' state.");
        game.state.start('waiting');
    });
    socket.on('gameStarted', function waitForReadyPlayers() {
        console.log('Both players in lobby, waiting for ready signals');
        setStatusText('Connecting to other player');
    });
    socket.on('ingredientsSet', function setIngredientInterface(ingredients) {
        events.emit('ingredientsSet', ingredients);
    });
}
var setup = {
    preload: function() {
        game.load.spritesheet('buttons', 'images/buttons.png', 210, 175);
        game.load.spritesheet('burger', 'images/burger.png', 256, 32);
    },
    create: function() {
        game.stage.backgroundColor = 0xffffff;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setMinMax(0, 0, 1050, 600);

        socket = io();
        setupSocketEvents();
    }
};

var waiting = {
    create: function() {
        setStatusText("Waiting for 2nd player");
    }
};
var main = {
    create: function() {
        console.log(game.statusText);
        game.speed = 10;
        game.difficulty = 1;
        game.strikes = 0;
        game.orders = [];
        game.platePositions = [];
        game.burgers = [];

        game.difficulty = 1;
        game.strikes = 0;

        game.interface = new Interface();

        console.log("Emitting ready signal");
        socket.emit('playerReady');
        socket.on('updateLoop', this.serverUpdate.bind(this));
        events.on('addBit', this.addBit, this);
    },
    update: function() {
        var dt = game.time.physicsElapsed;
        for (var i = 0; i < game.burgers.length; i++) {
            game.burgers[i].update(dt, game.speed);
        }
    },
    serverUpdate: function(data) {
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

        if (game.orders.length > 0) {
            console.log(game.orders[0].specification, data.orders[0]);
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
        game.difficulty = data.difficulty;
        game.strikes = data.strikes;
        game.speed = data.speed;
    },
    addBit: function(index) {
        game.burgers[game.burgers.length - 1].addBit(index);
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
    isBurgerCorrect: function(index) {
        return game.orders[0].checkBurger(game.burgers[index]);
    }
};
var game = new Phaser.Game(1050, 600, Phaser.AUTO);
game.state.add('setup', setup);
game.state.start('setup');
game.state.add('waiting', waiting);
game.state.add('main', main);