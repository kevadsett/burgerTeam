var Interface = function() {
    events.on('ingredientsSet', this.onIngredientsSet, this);
    game.add.button(840, 0, 'buttons', this.onSubmitPressed, this, 4, 4, 4, 4);
};

Interface.prototype = {
    onButtonPressed: function(button) {
        events.emit('addBit', button.index);
    },
    onSubmitPressed: function() {
        var firstBurgerOrder = game.orders.shift();
        var frontBurger = game.burgers.shift();
        console.log("Submitting order", firstBurgerOrder.specification, frontBurger.getSpec());
        socket.emit('submitOrder', firstBurgerOrder.specification, frontBurger.getSpec());
        if (firstBurgerOrder.checkBurger(frontBurger)) {
            console.log("You got it right!");
            game.difficulty++;
        } else {
            console.log("You got it wrong!");
            if (game.strikes === 3) {
                console.log("Game over");
                game.paused = true;
            } else {
                game.strikes++;
            }
        }
        frontBurger.destroy();
        firstBurgerOrder.destroy();
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
    }
};