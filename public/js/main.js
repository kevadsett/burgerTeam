var main = {
	create: function() {
		game.stage.backgroundColor = 0xffffff;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setMinMax(0, 0, 1050, 600);
	}
}
var game = new Phaser.Game(1050, 600, Phaser.AUTO);
game.state.add('main', main);
game.state.start('main');