var Dispenser = function() {
    this.sprite = game.add.sprite(0, 0, 'dispenser');
    this.sprite.anchor.setTo(0.5, 0.8);
    this.dispenseTween = game.add.tween(this.sprite).to({y: 40}, 125).to({y: 0}, 75);
};

Dispenser.preload = function() {
    game.load.image('dispenser', 'images/dispenser.png');
};

Dispenser.prototype = {
    updatePosition: function(dt, newX, predictedNextX) {
        if (!this.isSubmitting) {
            this.sprite.x = newX;
        } else if (this.movingBack) {
            console.log("this.sprite.x:", this.sprite.x, " newX:", newX, " predictedNextX:", predictedNextX);
            if (this.sprite.x > predictedNextX) {
                this.sprite.x -= dt * 1750;

            } else {
                this.movingBack = false;
                this.isSubmitting = false;
            }
        }
    },
    playDispenseAnim: function() {
        this.dispenseTween.start();
    },
    playSubmitAnim: function() {
        this.isSubmitting = true;
        var submitTween = game.add.tween(this.sprite).to({y: game.world.height / 2}, 125);
        submitTween.onComplete.add(this.onDownTweenComplete, this);
        submitTween.start();
    },
    onDownTweenComplete: function() {
        events.emit('submitPlate');
        var finishSubmitTween = game.add.tween(this.sprite).to({y: 0}, 75);
        finishSubmitTween.onComplete.add(this.onUpTweenComplete, this);
        finishSubmitTween.start();
    },
    onUpTweenComplete: function() {
        events.emit('submitAnimFinished');
        this.movingBack = true;
    }
};