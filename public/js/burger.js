var Burger = function(position, plateIndex) {
    this.bits = [];
    this.plateIndex = plateIndex;
    this.sliceIndex = 0;
    this.position = position;
};

Burger.prototype = {
    update: function(dt) {
        this.position.x += dt * game.speed;
        for (var i = 0; i < this.bits.length; i++) {
            this.bits[i].update(this.position.x);
        }
    },
    addBit: function(type) {
        this.bits.push(new BurgerBit(this.position.x, this.position.y - (this.sliceIndex * 32), type));
        this.sliceIndex++;
    },
    destroy: function() {
        for (var i = 0; i < this.bits.length; i++) {
            this.bits[i].destroy();
        }
        this.bits = null;
    }
};