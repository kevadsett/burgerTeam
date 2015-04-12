var BurgerBit = require('../modules/burgerBit');

var Burger = function(position, plateIndex) {
    this.bits = [];
    this.plateIndex = plateIndex;
    this.bitIndex = 0;
    this.position = position;
};

Burger.prototype = {
    update: function(dt, speed) {
        this.position.x += dt * speed;
        for (var i = 0; i < this.bits.length; i++) {
            this.bits[i].update(this.position.x);
        }
    },
    addBit: function(type) {
        this.bits.push(new BurgerBit(this.position.x, this.position.y - (this.bitIndex * 32), type));
        this.bitIndex++;
    }
};

module.exports = Burger;