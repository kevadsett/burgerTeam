var main = {
    preload: function() {
        game.load.spritesheet('buttons', 'images/buttons.png', 210, 175);
        game.load.spritesheet('burger', 'images/burger.png', 256, 32);
    },
    create: function() {
        game.burgerPosition = [{
            x: 0,
            y: game.world.height / 2
        }];
        this.sliceIndex = 0;
        this.speed = 10;
        game.burgerBits = [];
        game.stage.backgroundColor = 0xffffff;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setMinMax(0, 0, 1050, 600);

        this.buttons = game.add.group();
        for (var i = 0; i < 5; i++) {
            var button = game.add.button(i * 210, 425, 'buttons', this.onButtonPressed, this, i, i, i, i);
            button.index = i;
            this.buttons.add(button);
        }
    },
    update: function() {
        var dt = game.time.physicsElapsed;
        game.burgerPosition[0].x += dt * this.speed;
        for (var i = 0; i < game.burgerBits.length; i++) {
            game.burgerBits[i].update(dt);
        }
    },
    onButtonPressed: function(button) {
        this.addBit(button.index);
    },
    addBit: function(index) {
        game.burgerBits.push(new BurgerBit(game.burgerPosition[0].x, game.burgerPosition[0].y - (this.sliceIndex * 32), index, 0));
        this.sliceIndex++;
    }
};
var game = new Phaser.Game(1050, 600, Phaser.AUTO);
game.state.add('main', main);
game.state.start('main');