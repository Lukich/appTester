var page = require('webpage').create();

page.onCallback = function(msg) {
	console.log("PHANTOM SAYS: " + msg);
}
page.open("https://www.iaacu.org/", function (status) {
	if (status === 'success') {
        console.log('framesCount ' + page.framesCount);
        console.log('framesName ' + page.framesName);
        console.log('switching to frame 0');
        page.switchToFrame(1);
        var ev = page.evaluate(function(){
            return document.location.href;
        });
		console.log('ev is ' + ev);
	} else {
		console.log('failed loading');
	}
    // var mainTitle = page.evaluate(function () {
    //     console.log('message from the web page');
    //     window.callPhantom('message from the web page');
    //     return document.querySelector("h1").textContent;
    // });
    // console.log('First title of the page is ' + mainTitle);
    slimer.exit()
});