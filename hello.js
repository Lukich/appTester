var page = require('webpage').create();
page.onCallback = function (msg) {
    console.log(msg);
};
page.open("https://www.ameriprise.com/", function (status) {
    console.log('framesCount ' + page.framesCount);
    page.switchToFrame(1);
    var mainTitle = page.evaluate(function () {
        return document.querySelector("#username");
    });
    console.log('Element is ' + mainTitle);
    slimer.exit();
});