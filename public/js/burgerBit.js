var BurgerBit = function(yOffset, frame, group) {
    this.sprite = game.add.sprite(0, -game.world.height / 2, 'ingredients', frame);
    group.add(this.sprite);
    var y = (yOffset * BurgerBit.SPRITE_SIZE.height / 2);
    game.add.tween(this.sprite).to({y: -y}, 125).start();
    this.sprite.anchor.setTo(0.5, 0.5);
    this.type = frame;
};

BurgerBit.SPRITE_SIZE = { width: 171, height: 66 };

BurgerBit.preload = function() {
    game.load.spritesheet('ingredients', 'images/ingredients.png', BurgerBit.SPRITE_SIZE.width, BurgerBit.SPRITE_SIZE.height);
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