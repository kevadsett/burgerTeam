var main = {
    preload: function() {
        game.load.image('kittenA', 'images/kittenA.jpeg');
        game.load.image('kittenB', 'images/kittenB.jpeg');
    },
    create: function() {
        game.stage.backgroundColor = 0xffffff;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setMinMax(0, 0, 1050, 600);

        this.buttons = game.add.group();
        for (var i = 0; i < 5; i++) {
            var button = game.add.button(i * 210, 390, 'kitten' + (i % 2 === 0 ? 'A' : 'B'), this.onButtonPressed);
            button.index = i;
            this.buttons.add(button);
        }
    },
    onButtonPressed: function(button) {
        console.log(button.index);
    }
}
var game = new Phaser.Game(1050, 600, Phaser.AUTO);
game.state.add('main', main);
game.state.start('main');