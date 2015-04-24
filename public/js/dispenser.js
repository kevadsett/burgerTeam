var Dispenser = function() {
    this.sprite = game.add.sprite(0, 0, 'dispenser');
    this.sprite.anchor.setTo(0.5, 1);
    this.dispenseTween = game.add.tween(this.sprite).to({y: 40}, 125).to({y: 0}, 75);
};

Dispenser.preload = function() {
    game.load.image('dispenser', 'images/dispenser.png');
};

Dispenser.prototype = {
    updatePosition: function(newX) {
        this.sprite.x = newX;
    },
    playDispenseAnim: function() {
        this.dispenseTween.start();
    }
};