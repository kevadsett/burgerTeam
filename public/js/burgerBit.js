var BurgerBit = function(x, y, frame, plate) {
    this.plateIndex = plate;
    this.sprite = game.add.sprite(x, y, 'ingredients', frame);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.type = frame;
};

BurgerBit.preload = function() {
    game.load.spritesheet('ingredients', 'images/ingredients.png', 171, 66);
};

BurgerBit.prototype = {
    update: function(newX) {
        this.sprite.x = newX;
    },
    updateData: function(newData) {
        this.sprite.x = newData.x;
        this.sprite.y = newData.y;
        this.sprite.frame = this.type = newData.type;
    },
    destroy: function() {
        this.sprite.destroy();
    }
};