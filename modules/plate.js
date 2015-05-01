var gameSize = require('../modules/gameSize');

module.exports = function(events) {
    this.position = {
        x: 0,
        y: 350
    };
    this.update = function(dt, speed) {
        if (!this.beingSubmitted) {
            this.position.x += dt * speed;
            if (this.position.x > gameSize.finalX) {
                events.emit('submitOrder');
            }
        }
    };
};
