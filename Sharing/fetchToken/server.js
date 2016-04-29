//standard libraries
var Path = require('path');
//external dependencies
var Logger = require('log4js');
var Express = require('express');
var BodyParser = require('body-parser');

var configs = require(process.argv[2]);

Logger.configure(require(Path.join(__dirname, 'log4js_conf.json')));
var logger = Logger.getLogger('fetchToken');

var platforms = ['facebook', 'tumblr'];
var handlers = [];

var app = Express();
app.use(Logger.connectLogger(
          Logger.getLogger('express', {level: 'auto'})));
app.use(Express.static(Path.join(__dirname, 'static')));
app.use(BodyParser.urlencoded({extended:false}));
platforms.forEach(function(platform, index){
  var Handler = require(Path.join(__dirname, platform+'.js'));
  var handler = new Handler(configs[platform]);
  handlers.push(handler);
  app.get('/auth/'+platform+'/conf', handler.getConfs.bind(handler));
  app.get('/auth/'+platform+'/start', handler.startAuth.bind(handler));
  app.get('/auth/'+platform+'/done', handler.endAuth.bind(handler));
  app.post('/auth/'+platform, handler.postAuth.bind(handler));
});

var port = 8012;
/*var server = */app.listen(port, function(){
  logger.info('server listening on port',port);
});
