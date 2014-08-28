/*

	I go through every app in the catalog.  Once I have an app I extract a first block of login script
	and run it.  I open page defined by url and pass it events as arguments.

@TODO:

2) wailtFor support

ameriprise - 3 frames why does it say 0 frames?
index - 79


112. Testing Authorize.Net (Merchant)...
no el, looking in frames
frames length is 1
looking in frame #0
caught error Error: Permission denied to access property 'document'
no el, looking in frames
frames length is 1
looking in frame #0
caught error Error: Permission denied to access property 'document'
FAIL
113. Testing Autodesk 360...
Failed to load image information - 
no el, looking in frames
frames length is 2
looking in frame #0
caught error Error: Permission denied to access property 'document'
looking in frame #1
caught error Error: Permission denied to access property 'document'
no el, looking in frames
frames length is 2
looking in frame #0
caught error Error: Permission denied to access property 'document'
looking in frame #1
caught error Error: Permission denied to access property 'document'
FAIL



4) abstract success and error messages

6) add -v flag support to shoe console logs
*/

var page = require('webpage').create();

page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36' 


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

page.onCallback = function(msg) {
	console.log(msg);
}

var fileSystem = require('fs'),
	args = require('system').args,
	APPS_DIR = 'apps',
	appsList = fileSystem.list(APPS_DIR),
	success = 0,
	fail = 0,
	successDetails = [],
	failDetails = [],
	errors = [],
	app,
	index = 0,
	specific = false;


if (args.length > 1) {
		//evaluate specific index
		index = args[1];
		specific = true;
}


var nextPage = function(index) {
	if ((specific && index !== args[1]) || (!specific && index > appsList.length)) {

		//we are done, generate report and exit

		var path = new Date()+ '.txt',
			content = 'Succeeded: ' + success + '\n' +
					  'Good sites: ' + JSON.stringify(successDetails) + '\n' +
					  'Failed: ' + fail + '\n' +
					  'Bad Sites: ' + JSON.stringify(failDetails, null, 4);
		if (errors.length > 0) {
			content += 'Errors: ' + JSON.stringify(errors, null, 4);
		}

		fileSystem.write(path, content, 'w');
		slimer.exit();
		return;
	}

	try {
		app = fileSystem.read(APPS_DIR+"/"+appsList[index]);
		app = JSON.parse(app);
	} catch (e) {
		app = null;
		errors.push('ERROR ' + e + ' FOR ' + appsList[index]);
	}

	if (!app) {
		index++;
		nextPage(index);
	} else {
		console.log(index + '. Testing ' + app.name + '...');
		page.open(app.login_url, function(status){
			if (status === 'success') {
				if (page.injectJs('a8tester.js')) {
					var ev = page.evaluate(function(){
						var appName = arguments[0],
							appEvents = arguments[1],
							response = {
								'name'	 : appName,
								'success': [],
								'failure': []
							},
							element,
							eventResult;


						appEvents.forEach(function(eventBlock){
							element = A8Tester.findElement(eventBlock.path, document);

							if (element) {
								/*
									v1: testing for presence of an element.  if it's an input dispatch a test value to it
									and ascertain that it hasveen applied correctly
								*/

								eventResult = A8Tester.eventDispatcher(element, eventBlock);
								if (eventResult) {
									response['success'].push('Success dispatching ' + eventBlock.type + ' to ' + eventBlock.path);
								} else {
									response['failure'].push('Failed to dispatch value during ' + eventBlock.type + ' to ' + eventBlock.path);
								}
							} else {
								response['failure'].push('Element not found ' + eventBlock.path);
							}				
						});
						return response;
					}, app.name, app.login_script[0].events);

					if (ev.failure.length === 0) {
						success++;
						successDetails.push(ev.name);
						console.log('OK');
					} else {
						fail++;
						delete ev.success;
						failDetails.push(ev);
						console.log('FAIL');
					}
				} else {
					fail++;
					var resp = Object.create(null);
					resp[app.name] = 'Failed to inject test code';
					errors.push(resp);
					console.log('FAIL');
				}
			} else {
				fail++;
				var resp = Object.create(null);
				resp[app.name] = 'Failed to load';
				errors.push(resp);
				console.log('FAIL');
			}
			window.setTimeout(function(){
				index++;
				nextPage(index);
			}, 1500);
		});		
	}
}

nextPage(index);
