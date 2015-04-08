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
        this.plateIndex = 0;
        game.burgers = [new Burger(game.burgerPositions[0], 0)];

        this.buttons = game.add.group();
        for (var i = 0; i < 5; i++) {
            var button = game.add.button(i * 210, 425, 'buttons', this.onButtonPressed, this, i, i, i, i);
            button.index = i;
            this.buttons.add(button);
        }

        new BurgerOrder(1);
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
    }
};
var game = new Phaser.Game(1050, 600, Phaser.AUTO);
game.state.add('main', main);
game.state.start('main');