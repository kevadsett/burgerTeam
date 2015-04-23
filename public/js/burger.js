var Burger = function(position, plateIndex, bits) {
    this.bits = bits || [];
    this.plateIndex = plateIndex;
    this.sliceIndex = 0;
    this.position = position;
};

Burger.prototype = {
    update: function(dt, speed) {
        this.position.x += dt * speed;
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
                this.bits.push(new BurgerBit(newBits[i].x, newBits[i].y, newBits[i].type));
                i++;
            }
        }
        this.sliceIndex = i;
    },
    addBit: function(type) {
        var bitX = this.position.x;
        var bitY = this.position.y - (this.sliceIndex * 32);
        this.bits.push(new BurgerBit(bitX, bitY, type));
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