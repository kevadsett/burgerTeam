var Teammate = function() {
    this.sprite = game.add.sprite(game.world.width / 2, 100, 'teammate');
    this.sprite.anchor.setTo(0.5, 0);
    socket.on('teammatePressed', this.animatePress.bind(this));
};

Teammate.prototype = {
    animatePress: function() {
        this.sprite.frame = 1;
        setTimeout(function() {
            this.sprite.frame = 0;
        }.bind(this), 250);
    }
};