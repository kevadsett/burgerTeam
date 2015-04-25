var INGREDIENT_COUNT = 4;
module.exports = {
    create: function(difficulty) {
        var i;
        var spec = [0];
        var bitsCount = Math.ceil(Math.random() * (difficulty + 1));
        for (i = 0; i < bitsCount; i++) {
            spec.push(2 + Math.floor(Math.random() * (INGREDIENT_COUNT - 2)));
        }
        spec.push(1);
        return spec;
    },
    checkBurger: function(targetSpec, burgerSpec) {
        var isCorrect = burgerSpec.length === targetSpec.length;
        for (var i = 0; i < burgerSpec.length && isCorrect; i++) {
            isCorrect = targetSpec[i] === burgerSpec[i];
        }
        return isCorrect;
    }
};