//standard libraries
var Path = require('path');
//external dependencies
var Logger = require('log4js');
var Express = require('express');
var BodyParser = require('body-parser');
//custom modules
var Poster = require(Path.join(__dirname, 'post.js'));
var Persister = require(Path.join(__dirname, 'persister.js'));

Logger.configure(require(Path.join(__dirname, 'log4js_conf.json')));

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

/**
 * Configure a server for handling photo and video posting requests
 * @constructor
 * @param {string} a_configFilename path to the config json
 * @param {int} a_port port number to listen on
 */
var Server = function(a_configFilename, a_port){
  this.port = a_port;
  this.configs = require(a_configFilename);
  this.logger = Logger.getLogger('postServer');
  this.persister = new Persister(a_configFilename);
  this.poster = new Poster(a_configFilename);
  this.poster.registerNotifier(this.persister);
  this.app = Express();
  this.app.use(allowCrossDomain);
  this.app.use(BodyParser.urlencoded({extended:false}));
  this.app.post('/photo', function photoPost(client_req, client_res){
    if (client_req.body && client_req.body.filename){
      var filename = client_req.body.filename;
      this.persister.get(filename).
        then(function(result){
          if (result){
            if (result.state !== 'failed'){
              this.logger.info('[Server::photoPost] already submitted', 
                               filename);
              //TODO: check state?
              client_res.sendStatus(200);
            } else {
              this.logger.info('[Server::postPhoto] retrying',filename);
              this.persister.update(filename, 'posting');
              this.poster.addPhoto(filename);
              client_res.sendStatus(201);
            }
          } else {
            this.logger.info('[Server::photoPost] adding',filename);
            this.persister.put(filename, 'photo', 'posting');
            this.poster.addPhoto(filename);
            client_res.sendStatus(201);
          }
        }.bind(this), function(reason){
          this.logger.error('[Server::photoPost] problem from persister', 
                            reason);
          client_res.sendStatus(500);
        }.bind(this));
    } else {
      this.logger.warn('[Server::photoPost] no filename supplied');
      client_res.sendStatus(400);
    }
  }.bind(this));
  this.app.post('/video', function videoPost(client_req, client_res){
    if (client_req.body && client_req.body.filename){
      var filename = client_req.body.filename;
      this.persister.get(filename).
        then(function(result){
          if (result){
            this.logger.info('[Server::videoPost] already submitted', 
                             filename);
            //TODO: check state?
            client_res.sendStatus(200);
          } else {
            this.logger.info('[Server::videoPost] adding',filename);
            this.persister.put(filename, 'video', 'posting');
            this.poster.addVideo(filename);
            client_res.sendStatus(201);
          }
        }.bind(this), function(reason){
          this.logger.error('[Server::videoPost] problem from persister', 
                            reason);
          client_res.sendStatus(500);
        }.bind(this));
    } else {
      this.logger.warn('[Server::videoPost] no filename supplied');
      client_res.sendStatus(400);
    }
  }.bind(this));
  this.app.get('/state', function isPosted(req, res){
    var filename = req.query.filename;
    if (!filename){
      this.logger.warn('[GET /state] no filename specified');
      res.sendStatus(400);
    } else {
      this.logger.info('[GET /state] checking', filename);
      this.persister.get(filename).then(function(result){
        if (result){
          res.send(result);
        } else {
          res.send({filename: filename,
                    type:     'unknown',
                    state:    'unknown'});
        }
      }.bind(this), function(reason){
        this.logger.error('[GET /state] problem from persister', reason);
        res.sendStatus(500);
      }.bind(this));
    }
  }.bind(this));
};

/**
 * start listening for connections
 */
Server.prototype.start = function(){
  var listenCallback = function(){
    this.logger.info('listening on port',this.port);
  }.bind(this);
  this.app.listen(this.port, listenCallback);
};

var port = 8013;
var server = new Server(process.argv[2], port);
server.start();
