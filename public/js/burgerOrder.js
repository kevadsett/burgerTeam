var SPRITE_HEIGHT = 20;
var ORDER_BG_HEIGHT = 275;
var rotateRange = Math.PI / 6;
var BurgerOrder = function(spec) {
    console.log("new order", spec);
    this.specification = spec;
    var i;
    this.burgerImage = game.add.group();
    game.ordersGroup.addChildAt(this.burgerImage, 0);
    this.burgerImage.x = 95 + (Math.random() * 10);
    var orderHeight = spec.length * SPRITE_HEIGHT;
    this.burgerImage.y = orderHeight - ORDER_BG_HEIGHT + 25;
    var slip = game.add.sprite(0, 0, 'orderSlip');
    slip.anchor.setTo(0.5, 0);
    this.burgerImage.add(slip);
    for (i = 0; i < this.specification.length; i++) {
        var type = this.specification[i];
        var orderIcon = game.add.sprite(0, 255 - (i * SPRITE_HEIGHT), 'orderIcons', type);
        orderIcon.anchor.setTo(0.5, 1);
        this.burgerImage.add(orderIcon);
    }
    // this.burgerImage.rotation = (Math.random() * rotateRange) - (rotateRange / 2);
};

BurgerOrder.preload = function() {
    game.load.spritesheet('orderIcons', 'images/foodorder.png', 76, 20);
    game.load.image('orderSlip', 'images/orderbg.png');
};

BurgerOrder.prototype = {
    checkBurger: function(burger) {
        var isCorrect = burger.specification.length === this.specification.length;
        for (var i = 0; i < burger.specification.length && isCorrect; i++) {
            isCorrect = this.specification[i] === burger.specification[i];
        }
        return isCorrect;
    },
    updateBits: function(newBits) {
        console.log(newBits);
        console.log("Resetting bits");
        this.burgerImage.removeAll();
        var offset = (newBits.length / 2) * spriteHeight;
        for (var i = 0; i < newBits.length; i++) {
            var existingBit = this.burgerImage.children[i] && this.burgerImage.getChildAt(i);
            if (existingBit) {
                console.log("Converting " + existingBit.frame + " to " + newBits[i]);
                existingBit.frame = newBits[i];
            } else {
                console.log("Making new " + newBits[i]);
                var orderIcon = game.add.sprite(0, offset + -(i * spriteHeight), 'orderIcons', newBits[i]);
                orderIcon.anchor.setTo(0.5, 0.5);
                this.burgerImage.add(orderIcon);
            }
        }
        var slip = game.add.sprite(0, 0, 'orderSlip');
        slip.anchor.setTo(0.5, 0.5);
        slip.scale.setTo(0.8, 0.8);
        this.burgerImage.addChildAt(slip, 0);
        this.burgerImage.rotation = (Math.random() * rotateRange) - (rotateRange / 2);
        this.specification = newBits;
    },
    destroy: function() {
        this.burgerImage.destroy();
    }
};