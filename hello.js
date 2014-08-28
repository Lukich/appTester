var page = require('webpage').create();
page.onConsoleMessage = function (msg) {
    console.log(msg);
};
page.open("http://slimerjs.org", function (status) {
	console.log('status is ' + status);
    var mainTitle = page.evaluate(function () {
        console.log('message from the web page');
        return document.querySelector("h1").textContent;
    });
    console.log('First title of the page is ' + mainTitle);
    slimer.exit();
});