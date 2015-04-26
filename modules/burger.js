var LOCATION = 'Burger::';

var Burger = function() {
    this.specification = [];
};

Burger.prototype = {
    addBit: function(type) {
        this.specification.push(type);
    }
};

module.exports = Burger;