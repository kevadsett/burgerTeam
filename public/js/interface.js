var Interface = function() {
    events.on('ingredientsSet', this.onIngredientsSet, this);
    game.add.button(840, 0, 'buttons', this.onSubmitPressed, this, 4, 4, 4, 4);
    this.satisfactionMeter = game.add.sprite(48, 48, 'satisfaction');
    this.satisfactionMeter.anchor.setTo(0, 0.5);
};

Interface.prototype = {
    onButtonPressed: function(button) {
        events.emit('addBit', button.index);
    },
    onSubmitPressed: function() {
        events.emit('submitOrder');
    },
    onIngredientsSet: function(ingredients) {
        if (this.buttons) {
            this.buttons.removeAll();
        } else {
            this.buttons = game.add.group();
        }
        for (var i = 0; i < ingredients.length; i++) {
            var frame = ingredients[i];
            var button = game.add.button(i * 210, 425, 'buttons', this.onButtonPressed, this, frame, frame, frame, frame);
            button.index = frame;
            this.buttons.add(button);
        }
    },
    updateSatisfaction: function(newSatisfaction) {
        this.satisfactionMeter.scale.setTo(newSatisfaction / 100, 1);
    }
};