var connectedUsers = {};
var pcAdjectives = [
    "big",
    "red",
    "blue",
    "tall",
    "thin",
    "fat",
    "short",
    "ugly",
    "fit",
    "fast",
    "slow",
    "real",
    "fake",
    "daft"
];
var pcNouns = [
    "boat",
    "car",
    "shoe",
    "house",
    "trout",
    "bun",
    "tv",
    "hair",
    "shop",
    "boss",
    "punk"
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