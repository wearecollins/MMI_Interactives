//standard libraries
var Path = require('path');
var ChildProcess = require('child_process');

var configs = require(Path.join(__dirname, 'loop_conf.json'));

var interval = setInterval(launchChild, configs.intervalMillis);
launchChild();

function launchChild(){
  console.log(Date(), 'running sync process');
  ChildProcess.fork(Path.join(__dirname, 'index.js'));
}
