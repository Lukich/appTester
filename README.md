tester.js uses slimerjs to run through all apps in the 'apps' directory and look for presence/validity of
elements in the login script.

utils.js contains utility functions.

In order to run it locally, go to the root directory and run ./slimerjs-0.9.2/slimerjs tester.js which would trigger
tests on all apps.

If you want to run a full-blown test, do an initial cloning of web apps into the apps directory, go to the 
root directory and execute . run.sh.  This will perform a test on all the webapps (takes roughly 14 hours),
generate a report, email it to webapps-tests@authentic8.com and keep the copy of the report in the reports directory.

You can control a number of tests you are running by specifying parameters:

1) ./slimerjs-0.9.2/slimerjs tester.js app=533  would perform a test only on app #533 in the list.

2) ./slimerjs-0.9.2/slimerjs tester.js max=10 would perform a test on the first 10 apps n the list.

3) ./slimerjs-0.9.2/slimerjs tester.js min=3 max=10 would perform a test starting with app 3 until app 10.

4) ./slimerjs-0.9.2/slimerjs tester.js verbose=true would perform a test in a verbose mode

@TODO:

1) support for specific iframe targeting

