var BurgerBit = function(x, y, frame, plate) {
    this.plateIndex = plate;
    this.sprite = game.add.sprite(x, y, 'burger', frame);
    this.sprite.anchor.setTo(0.5, 0.5);
};

BurgerBit.prototype = {
    update: function(newX) {
        this.sprite.x = newX;
    }
};