var SATISFACTION_BAR = {
    x: 977,
    y: 576,
    width: 906,
    height: 26
};
var Interface = function() {
    var i;
    this.secondsPerFrame = 1 / game.speed;
    this.animDt = 0;
    events.on('ingredientsSet', this.onIngredientsSet, this);
    events.on('showGoButton', this.showGoButton, this);
    game.add.sprite(0, 0, 'bg');
    this.dispenser = new Dispenser();
    this.icons = game.add.group();
    this.buttons = game.add.group();
    this.conveyor = game.add.group();
    for (i = 0; i < 9; i++) {
        var button = game.add.button((i * 101), 420, 'ingredientButton', this.onIngredientSelected, this, 0, 0, 1, 0);
        this.buttons.add(button);
        var icon = game.add.sprite((i * 101), 420, 'ingredientIcons', 12);
        this.icons.add(icon);
    }
    this.goButton = game.add.button(940, 440, 'goButton', this.onSubmitPressed, this, 0, 0, 1, 0);
    this.satisfactionMask = game.add.sprite(SATISFACTION_BAR.x, SATISFACTION_BAR.y, 'satisfactionMask');
    this.satisfactionMask.anchor.setTo(1, 0.5);
    this.satisfactionMask.scale.setTo(0, 1);
    for (i = 0; i < 5; i++) {
        var conveyorWheel = game.add.sprite(85 + (i * 201), 394, 'conveyor', Math.floor(Math.random() * 17));
        this.conveyor.add(conveyorWheel);
    }
};

Interface.preload = function() {
    game.load.spritesheet('ingredientButton', 'images/foodselectbtns.png', 101, 131);
    game.load.spritesheet('ingredientIcons', 'images/foodselect.png', 101, 131);
    game.load.spritesheet('goButton', 'images/orderreadybtn.png', 82, 81);
    game.load.spritesheet('conveyor', 'images/conveyoranim180.png', 32, 32);
    game.load.image('bg', 'images/bg.png');
    game.load.image('satisfactionMask', 'images/progressmask.png');
    game.load.image('satisfactionDent', 'images/progressdent.png');
    Dispenser.preload();
};

Interface.prototype = {
    updateDispenserPosition: function(dt, newX, nextX) {
        this.dispenser.updatePosition(dt, newX, nextX);
        this.animDt += dt;
        if (this.animDt > this.secondsPerFrame) {
            this.animDt -= this.animDt;
            for (var i = 0; i < this.conveyor.children.length; i++) {
                var wheel = this.conveyor.getChildAt(i);
                wheel.frame = (wheel.frame + 1) % 17;
            }
        }
    },
    onIngredientSelected: function(button) {
        this.dispenser.playDispenseAnim();
        events.emit('addBit', button.ingredient);
    },
    onSubmitPressed: function() {
        events.emit('submitOrder');
    },
    onIngredientsSet: function(ingredients) {
        console.log("Ingredients received:", ingredients);
        var usedButtonCount = 0;
        for (var i = 0; i < ingredients.length; i++) {
            if (this.icons.children[i]) {
                this.icons.getChildAt(i).frame = ingredients[i];
            }
            this.buttons.getChildAt(i).ingredient = ingredients[i];
            this.buttons.getChildAt(i).input.enabled = true;
            this.buttons.getChildAt(i).frame = 0;
            usedButtonCount++;
        }
        console.log("Used buttons: " + usedButtonCount);
        while (usedButtonCount < 9) {
            var icon = this.icons.getChildAt(usedButtonCount);
            icon.frame = INGREDIENT_COUNT;
            console.log("clearing " + usedButtonCount, icon.frame);
            this.buttons.getChildAt(usedButtonCount).ingredient = -1;
            this.buttons.getChildAt(usedButtonCount).input.enabled = false;
            this.buttons.getChildAt(usedButtonCount).frame = 2;
            usedButtonCount++;
        }
    },
    updateSatisfaction: function(newSatisfaction) {
        this.satisfactionMask.scale.setTo(1 - (newSatisfaction / 100), 1);
        if (this.dent) {
            var x = SATISFACTION_BAR.x - (SATISFACTION_BAR.width -(SATISFACTION_BAR.width / 100) * game.satisfaction);
            this.dent.x = x;
        }
    },
    showSatisfactionDent: function(dentAmount) {
        this.showingDent = true;
        var width = (SATISFACTION_BAR.width / 100) * dentAmount;
        var x = SATISFACTION_BAR.x - (SATISFACTION_BAR.width -(SATISFACTION_BAR.width / 100) * game.satisfaction);
        var y = SATISFACTION_BAR.y;
        this.dent = game.add.sprite(x, y, 'satisfactionDent');
        this.dent.width = width;
        this.dent.anchor.setTo(0, 0.5);
        var tween = game.add.tween(this.dent).to({width: 0}, 250).delay(500).start();
        tween.onComplete.add(function() {
            this.showingDent = false;
            this.dent.destroy();
        }.bind(this));
    },
    playSubmitAnimation: function(callback, context) {
        this.dispenser.playSubmitAnim(callback, context);
    },
    showGoButton: function(show) {
        this.goButton.visible = show;
    }
};