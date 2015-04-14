
module.exports = {
    create: function(difficulty) {
        var i;
        var spec = [0];
        var bitsCount = Math.ceil(Math.random() * (difficulty + 1));
        for (i = 0; i < bitsCount; i++) {
            spec.push(Math.ceil(Math.random() * 4));
        }
        spec.push(0);
        return spec;
    },
    checkBurger: function(targetSpec, burgerSpec) {
        var isCorrect = burgerSpec.length === targetSpec.length;
        for (var i = 0; i < burgerSpec.length && isCorrect; i++) {
            isCorrect = targetSpec[i] === burgerSpec[i].type;
        }
        return isCorrect;
    }
};