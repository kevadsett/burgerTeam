var Burger = function(position, plateIndex, bits) {
    this.bits = bits || [];
    this.bitGroup = game.add.group();
    game.burgerGroup.add(this.bitGroup);
    this.plateIndex = plateIndex;
    this.sliceIndex = 0;
    this.position = position;
};

Burger.BUN_BOTTOM = 0;
Burger.BUN_TOP = 1;
Burger.PATTY = 2;
Burger.LETTUCE = 3;

Burger.prototype = {
    update: function() {
        for (var i = 0; i < this.bits.length; i++) {
            this.bits[i].update(this.position.x);
        }
    },
    updateBits: function(newBits) {
        if (newBits.length === 0) {
            return this.destroy();
        }
        for (var i = 0; i < this.bits.length; i++) {
            this.bits[i].updateData(newBits[i]);
        }
        if (i < newBits.length) {
            while (i < newBits.length) {
                this.bits.push(new BurgerBit(newBits[i].x, newBits[i].y, newBits[i].type, this.bitGroup));
                i++;
            }
        }
        this.sliceIndex = i;
    },
    addBit: function(type) {
        var bitX = this.position.x;
        var bitY = this.position.y - (this.sliceIndex * 32);
        this.bits.push(new BurgerBit(bitX, bitY, type, this.bitGroup));
        this.sliceIndex++;
    },
    destroy: function() {
        for (var i = 0; i < this.bits.length; i++) {
            this.bits[i].destroy();
        }
        this.bits = [];
    },
    getSpec: function() {
        var spec = [];
        for (var i = 0; i < this.bits.length; i++) {
            spec.push(this.bits[i].type);
        }
        return spec;
    }
};