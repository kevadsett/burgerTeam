var BurgerSpecification = function(difficulty) {
    var i;
    this.target = [0];
    var bitsCount = Math.ceil(Math.random() * (difficulty + 1));
    for (i = 0; i < bitsCount; i++) {
        this.target.push(Math.ceil(Math.random() * 4));
    }
    this.target.push(0);
};

BurgerSpecification.prototype = {
    checkBurger: function(burger) {
        var isCorrect = burger.bits.length === this.target.length;
        for (var i = 0; i < burger.bits.length && isCorrect; i++) {
            isCorrect = this.target[i] === burger.bits[i].type;
        }
        return isCorrect;
    }
};

module.exports = BurgerSpecification;