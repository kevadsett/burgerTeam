var Interface = function() {
    events.on('ingredientsSet', this.onIngredientsSet, this);
    events.on('showGoButton', this.showGoButton, this);
    game.add.sprite(0, 0, 'bg');
    this.dispenser = new Dispenser();
    this.icons = game.add.group();
    this.buttons = game.add.group();
    for (var i = 0; i < 9; i++) {
        var button = game.add.button((i * 101), 420, 'ingredientButton', this.onIngredientSelected, this, 0, 0, 1, 0);
        this.buttons.add(button);
        var icon = game.add.sprite((i * 101), 420, 'ingredientIcons', 12);
        this.icons.add(icon);
    }
    this.goButton = game.add.button(940, 440, 'goButton', this.onSubmitPressed, this, 0, 0, 1, 0);
    this.satisfactionMeter = game.add.sprite(48, 48, 'satisfaction');
    this.satisfactionMeter.anchor.setTo(0, 0.5);
};

Interface.preload = function() {
    game.load.spritesheet('ingredientButton', 'images/foodselectbtns.png', 101, 131);
    game.load.spritesheet('ingredientIcons', 'images/foodselect.png', 101, 131);
    game.load.spritesheet('goButton', 'images/orderreadybtn.png', 82, 81);
    game.load.image('bg', 'images/bg.png');
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
        for (var i = 0; i < ingredients.length; i++) {
            if (this.icons.children[i]) {
                this.icons.getChildAt(i).frame = ingredients[i];
            }
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