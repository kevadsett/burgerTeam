var connectedUsers = {};
var pcAdjectives = [
    "giant",
    "tiny",
    "beautiful",
    "ugly",
    "edible",
    "gross",
    "meaningful",
    "meaningless",
    "breakable",
    "tough",
    "mathmatical",
    "grammatical",
    "woolen",
    "wooden",
    "old",
    "new",
    "gorgeous"
];
var pcNouns = [
    "puzzle",
    "monkey",
    "boat",
    "car",
    "shoes",
    "house",
    "trousers",
    "trout",
    "hedgehog",
    "burger",
    "buns",
    "fireplace",
    "table",
    "tv",
    "hair",
    "shop",
];

var potentialPasscodes = [];
var unusedPasscodes = [];
for (var i = 0; i < pcAdjectives.length; i++) {
    for (var j = 0; j < pcNouns.length; j++) {
        var passcode = pcAdjectives[i] + " " + pcNouns[j];
        potentialPasscodes.push(passcode);
        unusedPasscodes.push(passcode);
    }
}

console.log(potentialPasscodes.length + " potential passcodes");

function generatePasscode() {
    if (unusedPasscodes.length === 0) return;

    var chosenIndex = Math.floor(Math.random() * unusedPasscodes.length);
    return unusedPasscodes.splice(chosenIndex, 1)[0];
}

exports.generate = generatePasscode;