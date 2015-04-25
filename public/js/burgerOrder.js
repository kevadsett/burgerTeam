var BurgerOrder = function(spec) {
    this.specification = spec;
    var spriteHeight = 18;
    console.log(spec);
    var i;
    var offset = (this.specification.length / 2) * spriteHeight;
    this.burgerImage = game.add.group();
    game.ordersGroup.addChildAt(this.burgerImage, 0);
    this.burgerImage.x = 100;
    this.burgerImage.y = 100;
    var slip = game.add.sprite(0, 0, 'orderSlip');
    slip.anchor.setTo(0.5, 0.5);
    slip.scale.setTo(0.8, 0.8);
    this.burgerImage.add(slip);
    for (i = 0; i < this.specification.length; i++) {
        var type = this.specification[i];
        var orderIcon = game.add.sprite(0, offset + -(i * spriteHeight), 'orderIcons', type);
        orderIcon.anchor.setTo(0.5, 0.5);
        this.burgerImage.add(orderIcon);
    }
    var rotateRange = Math.PI / 3;
    this.burgerImage.rotation = (Math.random() * rotateRange) - (rotateRange / 2);
};

BurgerOrder.preload = function() {
    game.load.spritesheet('orderIcons', 'images/orderIcons.png', 73, 18);
    game.load.image('orderSlip', 'images/orderSlip.png');
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