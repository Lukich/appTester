/*

	I go through every app in the catalog.  Once I have an app I extract a first block of login script
	and run it.  I open page defined by url and pass it events as arguments.

@TODO:

support for specific iframe lookup
add -v flag support to shoe console logs
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
	specific = false,
	params = {},
	handleSuccess = function(name){
		success++;
		successDetails.push(name);
		console.log('OK');
	},
	handleFailure = function(responseObj){
		fail++;
		if (responseObj.success) {
			delete responseObj.success;
		}
		failDetails.push(responseObj);
		console.log('FAIL');
	},
	message = function(app, msg){
		var resp = Object.create(null);
		resp[app.name] = msg;
		return resp;
	},
	generateReport = function(){
		var path = 'report.txt',
			content = 'Succeeded: ' + success + '\n' +
					  'Good sites: ' + JSON.stringify(successDetails) + '\n' +
					  'Failed: ' + fail + '\n' +
					  'Bad Sites: ' + JSON.stringify(failDetails, null, 4);
		if (errors.length > 0) {
			content += 'Errors: ' + JSON.stringify(errors, null, 4);
		}

		fileSystem.write(path, content, 'w');	
	};


if (args.length > 1) {
	args.forEach(function(a){
		var spl = a.split('=');
		params[spl[0]] = parseInt(spl[1]);
	});

	if (params['app']) {
		index = params['app'];
		specific = true;
	} else if (params['max']) {
		specific = true;
	}
}


var nextPage = function(index) {
	var enough = false;
	if (specific) {
		if (params['max']) {
			enough = (index >= params['max']);
		} else if (params['app']) {
			enough = (index !== params['app']);
		}
	} else {
		enough = (index > appsList.length);
	}

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
				if (page.injectJs('utils.js')) {
					var response = {
						'name': app.name,
						'success': [],
						'failure': []
						},
						WAIT_INTERVAL = 500,
						WAIT_TIMEOUT = 5000;

					//go through each event in event block
					app.login_script[0].events.forEach(function(ev){
						var found = false,
							runFinder = function(path) {
								var el, 
									framesLength = 0,
									current = 0;
								//look on main page
								el = page.evaluate(function(){
									return A8Tester.findElement(arguments[0], document);
								}, path);
								//if not found, get iframes
								if (!el) {
									framesLength = page.framesCount;
								}
								//switch to every iframe	
								while (!el && current <= framesLength - 1) {
									page.switchToFrame(current);

									if (page.injectJs('utils.js')) {
								//look for path
										el = page.evaluate(function(){
											return A8Tester.findElement(arguments[0], document);
										}, path);
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

						if (ev.waitFor) {
							var stop;
							if (typeof ev.waitFor === 'boolean') {
									stop = Date.now()+WAIT_TIMEOUT,
									interval = Date.now()+WAIT_INTERVAL; 

								while (!found && Date.now() < stop) {
									if (Date.now() > interval) {
										found = runFinder(ev.path);
										interval+=WAIT_INTERVAL;
									}
								}
							} else {
								//implement pause
								stop = Date.now()+wait;
								while (Date.now() < stop) {/*pause*/}
								found = runFinder(ev.path);
							}
						} else {
							found = runFinder(ev.path);
						}

						if (found) {
							response['success'].push('Element found ' + ev.path);
						} else {
							response['failure'].push('Element not found ' + ev.path);
						}

					});

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
