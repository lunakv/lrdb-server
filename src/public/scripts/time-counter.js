document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("run").addEventListener("click", () => {
        var input = document.getElementById("text").value;
        var text = "Jedno přehrání tohoto textu potrvá asi " + getMorseTime(input) + " sekund.";
        document.getElementById("result").innerText = text;
    });
});

function getMorseTime(input){
    var time = 0;
    for (var i = 0; i < input.length; i++) {
        time += morseLetterTime(input[i]);
    }

    return time / 1000;
}

var UNIT_TIME = 200;
var CHAR_TIME = 600;
var SPACE_TIME = 1400;

function morseLetterTime(c) {
    var t = 0;
    switch (c.toLowerCase()) {
        case 'e':
            t = 2;
            break;
        case 'i':
        case 't':
            t = 4;
            break;
        case 'a':
        case 'n':
        case 's':
            t = 6;
            break;
        case 'd':
        case 'h':
        case 'm':
        case 'r':
        case 'u':
            t = 8;
            break;
        case 'b':
        case 'f':
        case 'g':
        case 'k':
        case 'l':
        case 'v':
        case 'w':
        case '5':
            t = 10;
            break;
        case 'c':
        case 'o':
        case 'p':
        case 'x':
        case 'z':
        case '4':
        case '6':
            t = 12;
            break;
        case 'j':
        case 'q':
        case 'y':
        case '3':
        case '7':
            t = 14;
            break;
        case '2':
        case '8':
            t = 16;
            break;
        case '1':
        case '9':
            t = 18;
            break;
        case '0':
            t = 20;
            break;
        case ' ':
            return 1400;
        default:
            return NaN;
    }
    
    return t * UNIT_TIME + CHAR_TIME;
}
