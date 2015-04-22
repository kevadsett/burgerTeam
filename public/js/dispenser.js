var Dispenser = function() {
    this.sprite = game.add.sprite(0, 0, 'dispenser');
    this.sprite.anchor.setTo(0.5, 0);
};

Dispenser.prototype = {
    updatePosition: function(newX) {
        this.sprite.x = newX;
    }
};