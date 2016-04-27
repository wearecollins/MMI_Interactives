//standard libraries
var Path = require('path');
//external dependencies
var Logger = require('log4js');
var Express = require('express');
var BodyParser = require('body-parser');
//custom modules
var Poster = require(Path.join(__dirname, 'post.js'));

Logger.configure(require(Path.join(__dirname, 'log4js_conf.json')));

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
  this.poster = new Poster(a_configFilename);
  this.app = Express();
  this.app.use(BodyParser.urlencoded({extended:false}));
  this.app.post('/photo', function photoPost(client_req, client_res){
    if (client_req.body && client_req.body.filename){
      var filename = client_req.body.filename;
      this.logger.info('[Server::photoPost] adding',filename);
      this.poster.addPhoto(filename);
    } else {
      this.logger.warn('[Server::photoPost] no filename supplied');
    }
    client_res.send(' ');
  }.bind(this));
  this.app.post('/video', function videoPost(client_req, client_res){
    if (client_req.body && client_req.body.filename){
      var filename = client_req.body.filename;
      this.logger.info('[Server::videoPost] adding',filename);
      this.poster.addVideo(filename);
    } else {
      this.logger.warn('[Server::videoPost] no filename supplied');
    }
    client_res.send(' ');
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
