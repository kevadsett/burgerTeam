var Teammate = function() {
    this.sprite = game.add.sprite(game.world.width / 2, game.world.height, 'teammate');
    this.sprite.anchor.setTo(0.5, 1);
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