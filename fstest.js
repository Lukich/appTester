var fs = require('fs');

var list = fs.list('apps');

var ex = list[0];

var content = fs.read('apps/'+list[0]);
console.log('content is ' + JSON.parse(content));

slimer.exit();