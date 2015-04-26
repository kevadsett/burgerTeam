var Interface = function() {
    events.on('ingredientsSet', this.onIngredientsSet, this);
    events.on('showGoButton', this.showGoButton, this);
    game.add.sprite(0, 358, 'console');
    this.dispenser = new Dispenser();
    this.buttons = game.add.group();
    this.icons = game.add.group();
    for (var i = 0; i < 4; i++) {
        var button = game.add.button(50 + (i * 150), 393, 'ingredientButton', this.onIngredientSelected, this, 0, 0, 1, 0);
        this.buttons.add(button);
    }
    this.goButton = game.add.button(840, 400, 'goButton', this.onSubmitPressed, this);
    this.satisfactionMeter = game.add.sprite(48, 48, 'satisfaction');
    this.satisfactionMeter.anchor.setTo(0, 0.5);
};

Interface.preload = function() {
    game.load.spritesheet('ingredientButton', 'images/ingredientButton.png', 123, 167);
    game.load.spritesheet('ingredientIcons', 'images/ingredientIcons.png', 95, 70);
    game.load.image('console', 'images/console.png');
    game.load.image('goButton', 'images/goButton.png');
    Dispenser.preload();
};

Interface.prototype = {
    updateDispenserPosition: function(dt, newX, nextX) {
        this.dispenser.updatePosition(dt, newX, nextX);
    },
    onIngredientSelected: function(button) {
        this.dispenser.playDispenseAnim();
        events.emit('addBit', button.ingredient);
    },
    onSubmitPressed: function() {
        events.emit('submitOrder');
    },
    onIngredientsSet: function(ingredients) {
        if (this.icons) {
            this.icons.removeAll();
        } else {
            this.icons = game.add.group();
        }
        for (var i = 0; i < ingredients.length; i++) {
            var icon = game.add.sprite(60 + (i * 150), 405, 'ingredientIcons', ingredients[i]);
            this.icons.add(icon);
            this.buttons.getChildAt(i).ingredient = ingredients[i];
        }
    },
    updateSatisfaction: function(newSatisfaction) {
        this.satisfactionMeter.scale.setTo(newSatisfaction / 100, 1);
    },
    playSubmitAnimation: function(callback, context) {
        this.dispenser.playSubmitAnim(callback, context);
    },
    showGoButton: function(show) {
        this.goButton.visible = show;
    }
};