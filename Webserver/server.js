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

// set up logging
Logger.configure(require('./log4js_conf.json'));
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
      logger.debug('configured as station:',station);
  }
}

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
    logger.debug('[resolved] config done loading');
    // set up HTTP handlers
    /**
     * Express server for simple middleware-based message handling
     * @type {Express}
     */
    var app = express();
    app.use(Logger.connectLogger(
              Logger.getLogger('express', {level: 'auto'})));
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(RemoteLogs.log(Logger));
    {
      //create full webpath <-> filepath mapping for directory lister
      //JSON dance to achieve deep-copy
      var staticList = JSON.parse(
                         JSON.stringify(
                           config.getConfig('additionalStatic') || []));
      staticList.push({diskPath: Path.join(__dirname, 'static'),
                       webPath:  '/'});
      app.use('/list', DirLister.list(staticList));
    }
    //setup additional static directories
    {
      var statics = config.getConfig('additionalStatic');
      if (statics){
        statics.forEach(function(item){
          logger.debug('[resolved] setting up static hosting of'
                       ,item.diskPath,'via',item.webPath);
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
