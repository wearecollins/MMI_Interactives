/**
 * @module server
 */

//standard libraries
var http = require('http');
var Path = require('path');
//external dependencies
var express = require('express');
var bodyParser = require('body-parser');
var Logger = require('log4js');
//custom modules
var Configer = require(Path.join(__dirname, 'configer.js'));
var WebSocket = require(Path.join(__dirname, 'websockets.js'));
var RemoteLogs = require(Path.join(__dirname, 'log4javascript_to_log4js.js'));
var DirLister = require(Path.join(__dirname, 'dirlister.js'));

var logger = Logger.getLogger('Server');

/**
 * The station this is serving and configured for
 * @type {string}
 */
var station = 'demo';

var argv = process.argv;
for (var argI = 0; argI < argv.length; argI++){
  switch(argv[argI]){
    case '--station':
      station = argv[++argI];
  }
}

// set up logging
Logger.configure(require('./log4js_conf.json'));

/**
 * handles persistent configs
 * @type {Configer}
 */
var config = new Configer(Logger.getLogger('Configer'));
//load this station's config
config.load('static/'+station+'/config.json').
  catch( reason => 
      logger.error('could not load configuration file', reason) ).
  then( function resolved(){
    // set up HTTP handlers
    /**
     * Express server for simple middleware-based message handling
     * @type {Express}
     */
    var app = express();
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(RemoteLogs.log(Logger));
    {
      //create full webpath <-> filepath mapping for directory lister
      var staticList = config.getConfig('additionalStatic') || [];
      staticList.push({diskPath: Path.join(__dirname, 'static'),
                       webPath:  '/'});
      app.use('/list', DirLister.list(staticList));
    }
    //setup additional static directories
    {
      var statics = config.getConfig('additionalStatic');
      if (statics){
        statics.forEach(function(item){
          app.use(item.webPath, express.static(item.diskPath));
        });
      }
    }
    //setup standard static directory
    app.use(express.static('static', {index:station+'.html'}));
    
    
    /**
     * server for accepting connections on the given port
     * @type {http.Server}
     */
    var server = http.createServer(app);
    
    /*eslint-disable no-unused-vars*/
    /**
     * Websocket server to handle websocket communication
     */
    var wss = new WebSocket(server, config, Logger.getLogger('websocket'));
    /*eslint-enable*/
    
    // listen to connections on the given port/interface
    var port = 8080;
    server.listen(port, function(){
      logger.info('listening on port',port);
    });
  });
