var main = {
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

        game.speed = 20;

        game.burgerPositions = [{
            x: 0,
            y: game.world.height / 2
        }];
        game.burgerOrders = [new BurgerOrder(game.difficulty)];
        game.burgers = [new Burger(game.burgerPositions[0], 0)];
        this.plateIndex = 0;

        game.difficulty = 1;
        game.strikes = 0;

        this.buttons = game.add.group();
        for (var i = 0; i < 5; i++) {
            var button = game.add.button(i * 210, 425, 'buttons', this.onButtonPressed, this, i, i, i, i);
            button.index = i;
            this.buttons.add(button);
        }

        game.add.button(840, 0, 'buttons', this.onSubmitPressed, this, 4, 4, 4, 4);
    },
    update: function() {
        var dt = game.time.physicsElapsed;
        for (var i = 0; i < game.burgers.length; i++) {
            game.burgers[i].update(dt);
        }
    },
    onButtonPressed: function(button) {
        this.addBit(button.index);
    },
    addBit: function(index) {
        game.burgers[this.plateIndex].addBit(index);
    },
    onSubmitPressed: function() {
        var firstBurgerOrder = game.burgerOrders.shift();
        var frontBurger = game.burgers.shift();
        if (firstBurgerOrder.checkBurger(frontBurger)) {
            console.log("You got it right!");
            game.difficulty++;
        } else {
            console.log("You got it wrong!");
            if (game.strikes === 3) {
                console.log("Game over");
                game.paused = true;
            } else {
                game.strikes++;
            }
        }
        frontBurger.destroy();
        firstBurgerOrder.destroy();
        this.addNewOrder();
    },
    addNewOrder: function() {
        game.burgerOrders.push(new BurgerOrder(game.difficulty));
        game.burgerPositions.push({
            x: 0,
            y: game.world.height / 2
        })
        game.burgers.push(new Burger(game.burgerPositions[game.burgerPositions.length - 1]))
    },
    isBurgerCorrect: function(index) {
        return game.burgerOrders[0].checkBurger(game.burgers[index]);
    }
};
var game = new Phaser.Game(1050, 600, Phaser.AUTO);
game.state.add('main', main);
game.state.start('main');