var BurgerOrder = function(difficulty) {
    this.x = 100;
    this.specification = [0];
    var bitsCount = Math.ceil(Math.random() * (difficulty + 1));
    for (var i = 0; i < bitsCount; i++) {
        this.specification.push(Math.ceil(Math.random() * 4));
    }
    this.specification.push(0);
    this.y = this.specification.length * 32;
    var offset = this.specification.length * 8;
    var burgerImage = game.add.group();
    for (var i = 0; i < this.specification.length; i++) {
        var type = this.specification[i];
        burgerImage.create(this.x, this.y - (i * 32), 'burger', type);
    }
    burgerImage.scale.setTo(0.5, 0.5);
};

BurgerOrder.prototype = {
	checkBurger: function(burger) {
        var isCorrect = burger.bits.length === this.specification.length;
        for (var i = 0; i < burger.bits.length && isCorrect; i++) {
            isCorrect = this.specification[i] === burger.bits[i];
        }
        return isCorrect;
	}
};