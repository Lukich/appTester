#!/usr/bin/env bash

APPS_PATH=apps
REPORTS_PATH=reports
SLIMERJS=slimerjs-0.9.2/slimerjs 
EMAIL=webapps-tests@authentic8.com
TESTER=tester.js

pushd $APPS_PATH
#git pull origin master
popd
#run test
./$SLIMERJS $TESTER
#email results
mail -s 'App autotest results' $EMAIL < report.txt
#move result file to reports directory
x=$(date)
mv report.txt $REPORTS_PATH/"$x".txt
