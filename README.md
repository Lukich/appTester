tester.js uses slimerjs to run through all apps in the 'apps' directory and look for presence/validity of
elements in the login script.

utils.js contains utility functions.

In order to run it go to the root directory and run ./slimerjs-0.9.2/slimerjs tester.js which would trigger
tests on all apps.

You can limit a number of tests you're running passing one of two parameters:

1) ./slimerjs-0.9.2/slimerjs tester.js app=533  would perform a test only on app #533 in the list.
2) ./slimerjs-0.9.2/slimerjs tester.js max=10 would perform a test on the first 10 apps n the list.

