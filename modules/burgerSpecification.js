var INGREDIENT_COUNT = 10;
var MAX_INGREDIENTS = 10;
var choiceCount = 0;
module.exports = {
    create: function(difficulty) {
        var i;
        var spec = [0];
        var bitsCount = Math.min(Math.ceil(Math.random() * (difficulty + 1)), MAX_INGREDIENTS);
        var choices = [];
        while (choices.length < choiceCount) {
            var bitChoice = 2 + Math.floor(Math.random() * (INGREDIENT_COUNT - 2));
            if (choices.indexOf(bitChoice) === -1) {
                choices.push(bitChoice);
            }
        }
        for (i = 0; i < bitsCount; i++) {
            var choiceIndex = Math.floor(Math.random() * choices.length);
            spec.push(choices[choiceIndex]);
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
    },
    addIngredientChoice: function() {
        choiceCount++;
    },
    getIngredientList: function(spec) {
        var ingredients = spec.slice();
        var ingredientList = [];
        while (ingredients.length) {
            var chosenIngredient = ingredients.splice(Math.floor(Math.random() * ingredients.length), 1)[0];
            if (ingredientList.indexOf(chosenIngredient) === -1) {
                ingredientList.push(chosenIngredient);
            }
        }
        return ingredientList;
    }
};