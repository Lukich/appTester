/*

	I go through every app in the catalog.  Once I have an app I extract a first block of login script
	and run it.  I open page defined by url and pass it events as arguments.

@TODO:

support for specific iframe lookup
*/

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
	appLength = appsList.length,
	specific = false,
	params = {},
	VERBOSE = false,
	REPORT_PATH = 'report.txt',
	tempLog = function(msg) {
		if (!fileSystem.exists(REPORT_PATH)) {
			fileSystem.write(REPORT_PATH, msg, 'w');
		} else {
			fileSystem.write(REPORT_PATH, msg, 'a');
		}
	},
	handleSuccess = function(name){
		success++;
		successDetails.push(name);
		console.log('OK');
		tempLog('Testing ' + name + ' : OK\n');
	},
	handleFailure = function(responseObj){
		fail++;
		if (responseObj.success) {
			delete responseObj.success;
		}
		failDetails.push(responseObj);
		console.log('FAIL');
		tempLog('Testing ' + responseObj['name'] + ' : FAIL\n' + '	Error: ' + JSON.stringify(responseObj['failure'])+'\n');
	},
	message = function(app, msg){
		var resp = Object.create(null);
		resp[app.name] = msg;
		return resp;
	},
	generateReport = function(){
		var path = REPORT_PATH,
			content = 'Succeeded: ' + success + '\n' +
					  'Good sites: ' + JSON.stringify(successDetails) + '\n' +
					  'Failed: ' + fail + '\n' +
					  'Bad Sites: ' + JSON.stringify(failDetails, null, 4);
		if (errors.length > 0) {
			content += '\nErrors: ' + JSON.stringify(errors, null, 4);
		}

		fileSystem.write(path, content, 'w');	
	},
	eventDispatcher = function(element, eventBlock) {
		var result = true,
			handleClick,
			handleChange,
			handleKeyPress,
			handleFocusBlur,
			generateRandomString,
			self = this;

			element.focus();

			generateRandomString = function(length) {
			    var text = "",
			    	length = length || 10,
			    	possible = "abcdefghijklmnopqrstuvwxyz0123456789";

			    for( var i=0; i < length; i++ )
			        text += possible.charAt(Math.floor(Math.random() * possible.length));

			    return text;
			}

			handleClick = function() {
				page.sendEvent('click');
				return true;
			};

			handleKeyPressChange = function() {
				try {
					var testString = generateRandomString();
					page.sendEvent('keypress', testString);
					slimer.wait(1000);
					return (element.value === testString);
				} catch (e) {
					console.log('Error handling keypress: ' + e);
					return false;
				} 
			};

			handleFocusBlur = function() {
				try {
					if (eventBlock.type === 'focus') {
						element.focus()
					} else {
						element.blur();
					}
					return true;
				} catch (e) {
					console.log('Error handling focus/blur: ' + e);
					return false;
				}
			}

		switch (eventBlock.type) {
			case 'click':
				result = handleClick();
				break;
			case 'keypress':
			case 'change':
				result = handleKeyPressChange();
				break;
			case 'focus':
			case 'blur':
				result = handleFocusBlur();
				break;
		};

		return result;
	},
	tell = function(msg) {
		if (VERBOSE) {
			console.log(msg);
		}
	};


if (args.length > 1) {
	args.forEach(function(a){
		var spl = a.split('=');
		params[spl[0]] = spl[1];
	});

	if (params['app'] !== undefined) {
		index = params['app'];
		appLength = params['app'];
	} 

	if (params['max'] !== undefined) {
		appLength = params['max'];
	} 

	if (params['min'] !== undefined) {
		index = params['min'];
	}

	if (params['verbose']) {
		VERBOSE = true;
	}
}


var nextPage = function(index) {
	var enough = (index > appLength);

	if (enough) {
		//we are done, generate report and exit

		generateReport();
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
				tell('Page loaded successfully. Url is ' + document.location.href);

				if (page.injectJs('utils.js')) {
					var response = {
						'name': app.name,
						'success': [],
						'failure': []
						},
						WAIT_INTERVAL = 1000,
						WAIT_TIMEOUT = 10000;

					//go through each event in event block
					app.login_script[0].events.forEach(function(ev){
						tell('Current event: ' + JSON.stringify(ev));
						var found = false,
							runFinder = function(path) {

								var el, 
									framesLength = 0,
									current = 0;
								//look on main page
								el = page.evaluate(function(){
									return A8Tester.findElement(arguments[0], document);
								}, path);

								tell('Main page, element is ' + el);

								//if not found, get iframes
								if (!el) {
									framesLength = page.framesCount;
									tell(framesLength + ' frames detected');
								}
								//switch to every iframe	
								while (!el && current <= framesLength - 1) {
									tell('Switching to frame ' + current);
									page.switchToFrame(current);
									if (page.injectJs('utils.js')) {
										//look for path
										el = page.evaluate(function(){
											return A8Tester.findElement(arguments[0], document);
										}, path);
										tell('Frame ' + current + '. Element is ' + el);
									} else {
										console.log('Failed to inject js into an iframe');
									}

									if (!el) {
										current++;
									}
									page.switchToMainFrame();
								}
								return el;
							};

						//perform find
						if (ev.waitFor) {
							var stop;

							if (typeof ev.waitFor === 'boolean') {
								tell('Boolean waitFor detected');
								//perform periodic lookup
								stop = Date.now()+WAIT_TIMEOUT;
								while (!found && Date.now() < stop) {
									slimer.wait(WAIT_INTERVAL);
									tell('Attempting periodic element lookup');
									found = runFinder(ev.path);
								}
							} else {
								//implement pause
								slimer.wait(ev.waitFor);
								found = runFinder(ev.path);
							}
						} else {
							found = runFinder(ev.path);
						}

						if (found) {
							tell('Element found');
							if (eventDispatcher(found, ev)) {
								// console.log('event dispatcher returned true');
								response['success'].push('Element found ' + ev.path);
							} else {
								tell('Unable to read value from it');
								response['failure'].push('Problem dispatching value to element ' + ev.path + ' for event type ' + ev.type);
							}
						} else {
							tell('Element not found');
							response['failure'].push('Element not found ' + ev.path);
						}

					});

					//update global report object
					if (response.failure.length === 0) {
						handleSuccess(response.name);
					} else {
						handleFailure(response);
					}
				} else {
					handleFailure(message(app.name, 'Failed to inject test code.'));
				}
			} else {
				handleFailure(message(app.name, 'Failed to load page.'));
			}
			window.setTimeout(function(){
				index++;
				nextPage(index);
			}, 1500);
		});		
	}
}

nextPage(index);
