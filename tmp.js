var page = require('webpage').create();

page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36' 
page.settings.loadImages = false;


page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    // uncomment to log into the console 
    // console.error(msgStack.join('\n'));
};

page.onResourceError = function(resourceError) {
    // system.stderr.writeLine('= onResourceError()');
    // system.stderr.writeLine('  - unable to load url: "' + resourceError.url + '"');
    // system.stderr.writeLine('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};

page.onCallback = function(msg) {
	console.log(msg);
}

page.onLoadFinished = function(status, url, isFrame) {
    console.log('in load finished. status ' + status + ' url ' + url + ' is frame ' + isFrame);
}

page.open('https://www.ameriprise.com/client-login/', function(status){
    if (status === 'success') {
        console.log('status success');
        console.log('number of frames is ' + page.framesCount);
    } else {
        console.log('status fail');
    }
    // slimer.exit();
});
