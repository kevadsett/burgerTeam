var Plate = function() {
    this.position = {
        x: 0,
        y: 350
    };
    this.sprite = game.add.sprite(this.position.x, this.position.y, 'plate');
    game.plateGroup.add(this.sprite);
    this.sprite.anchor.setTo(0.5, 0);
};

Plate.preload = function() {
    game.load.image('plate', 'images/plate.png');
};

Plate.prototype = {
    update: function(dt) {
        if (!this.beingSubmitted) {
            this.position.x += dt * game.speed;
            this.sprite.x = this.position.x;
            if (this.position.x > game.finalX) {
                events.emit('submitOrder');
            }
        }
    },
    destroy: function() {
        this.sprite.destroy();
    }
};