var Burger = function(position, spec) {
    this.bitGroup = game.add.group(game.burgersGroup);
    this.bitGroup.x = 0;
    this.bitGroup.y = game.plates[0].position.y;
    this.position = position;
    this.specification = spec || [];
    if (spec && spec.length > 0) {
        this.addNewBits(spec);
    }
};

Burger.BUN_BOTTOM = 0;
Burger.BUN_TOP = 11;
Burger.PATTY = 2;
Burger.LETTUCE = 3;

Burger.prototype = {
    update: function() {
        this.bitGroup.x = this.position.x;
    },
    addBits: function(fromIndex, spec) {
        for (var i = fromIndex; i < spec.length; i++) {
            this.addBit(spec[i]);
        }
    },
    replaceBits: function(spec) {
        this.bitGroup.removeAll();
        this.specification = [];
        this.addBits(0, spec);
    },
    addNewBits: function(spec) {
        this.addBits(Math.max(0, this.specification.length - 1), spec);
    },
    addBit: function(type) {
        console.log("Adding " + type + " to " + this.specification);
        new BurgerBit(this.specification.length, type, this.bitGroup);
        this.specification.push(type);
    },
    destroy: function() {
        this.bitGroup.destroy();
    }
};