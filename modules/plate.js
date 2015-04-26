var gameSize = require('../modules/gameSize');

var Plate = function() {
    this.position = {
        x: 0,
        y: gameSize.height / 2
    };
};

Plate.preload = function() {
    game.load.image('plate', 'images/plate.png');
};

Plate.prototype = {
    update: function(dt, speed) {
        if (!this.beingSubmitted) {
            this.position.x += dt * speed;
            if (this.position.x > gameSize.finalX) {
                // submit this order and send to clients
            }
        }
    }
};

module.exports = Plate;