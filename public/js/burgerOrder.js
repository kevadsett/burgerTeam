var BurgerOrder = function(spec) {
    this.specification = spec;
    console.log(spec);
    var i;
    this.x = 100;
    this.y = this.specification.length * 18;
    var offset = this.specification.length * 8;
    this.burgerImage = game.add.group();
    for (i = 0; i < this.specification.length; i++) {
        var type = this.specification[i];
        this.burgerImage.create(this.x, this.y - (i * 18), 'orderIcons', type);
    }
};

BurgerOrder.preload = function() {
    game.load.spritesheet('orderIcons', 'images/orderIcons.png', 73, 18);
};

BurgerOrder.prototype = {
    checkBurger: function(burger) {
        var isCorrect = burger.bits.length === this.specification.length;
        for (var i = 0; i < burger.bits.length && isCorrect; i++) {
            isCorrect = this.specification[i] === burger.bits[i].type;
        }
        return isCorrect;
    },
    updateBits: function(newBits) {
        if (newBits.length < this.specification.length) {
            this.burgerImage.removeAll();
        }
        for (var i = 0; i < newBits.length; i++) {
            var existingBit = this.burgerImage.children[i] && this.burgerImage.getChildAt(i);
            if (existingBit) {
                existingBit.frame = newBits[i];
            } else {
                this.burgerImage.create(this.x, this.y - (i * 32), 'burger', newBits[i]);
            }
        }
    },
    destroy: function() {
        this.burgerImage.destroy();
    }
};