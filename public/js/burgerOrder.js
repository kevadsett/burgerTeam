var BurgerOrder = function(spec) {
    this.specification = spec;
    var i;
    this.x = 100;
    this.y = this.specification.length * 32;
    var offset = this.specification.length * 8;
    this.burgerImage = game.add.group();
    for (i = 0; i < this.specification.length; i++) {
        var type = this.specification[i];
        this.burgerImage.create(this.x, this.y - (i * 32), 'burger', type);
    }
    this.burgerImage.scale.setTo(0.5, 0.5);
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