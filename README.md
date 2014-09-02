tester.js uses slimerjs to run through all apps in the 'apps' directory and look for presence/validity of
elements in the login script.

utils.js contains utility functions.

In order to run it go to the root directory and run ./slimerjs-0.9.2/slimerjs tester.js which would trigger
tests on all apps.

You can control a number of tests you are running by specifying parameters:
 
1) ./slimerjs-0.9.2/slimerjs tester.js app=533  would perform a test only on app #533 in the list.

2) ./slimerjs-0.9.2/slimerjs tester.js max=10 would perform a test on the first 10 apps n the list.

3) ./slimerjs-0.9.2/slimerjs tester.js min=3 max=10 would perform a test starting with app 3 until app 10.

4) ./slimerjs-0.9.2/slimerjs tester.js verbose=true would perform a test in a verbose mode

@TODO:

1) support for specific iframe targeting

2) ignoring the manual apps