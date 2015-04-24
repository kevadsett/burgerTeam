var BurgerBit = function(x, y, frame, group) {
    this.sprite = game.add.sprite(x, 0, 'ingredients', frame);
    group.add(this.sprite);
    game.add.tween(this.sprite).to({y: y}, 125).start();
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