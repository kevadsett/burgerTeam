var BurgerBit = function(x, y, frame, plate) {
    this.plateIndex = plate;
    this.type = frame;
    this.x = x;
    this.y = y;
};

BurgerBit.prototype = {
    update: function(newX) {
        this.x = newX;
    }
}

module.exports = BurgerBit;