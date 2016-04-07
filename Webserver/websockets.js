/**
 * @module websockets
 */

var WebSocket = require('ws');

/**
 * @constructor
 */
var Websockets = function(server, configer, logger){
  /**
   * Websocket server to handle websocket communication
   * @type {ws}
   */
  var wss = new WebSocket.Server({server});

  /**
   * all active WebSocket connections
   * @type {ws.WebSocket[]}
   */
  var wsConnections = [];
  
  /**
   * handle an incoming message from one of the websocket connections
   */
  function gotMessage(message, flags){
    logger.debug(message);
    var forwardMsg = true;
  
    //if the message is a config type
    if (message && !flags.binary){
      try {
        var json = JSON.parse(message);
        if (json.config){
          forwardMsg = false;
          configer.updateConfig(json).
            then( () => sendMessage(configer.getConfigString()) );
        }
      } catch(err){
        logger.warn(err);
      }
    } 
  
    if (forwardMsg){
      sendMessage(message, this);
    }
  }
  
  /**
   * sends the provided message to all connections.
   * @param {string|ArrayBuffer} msg the message to forward
   * @param {websocketConnection} [wsToSkip] a connection to skip sending on.
   *  for message duplication this would be the connection the original message
   *  came from
   */
  function sendMessage(msg, wsToSkip){
    for(var wsI = wsConnections.length - 1;
        wsI >= 0;
        wsI--){
      var ws = wsConnections[wsI];
      if (ws !== wsToSkip){
        try {
          wsConnections[wsI].send(msg);
        } catch (e) {
          logger.error('problem sending message', e);
        }
      }
    }
  }

  /**
   * When we get a new connection, 
   *  set up handlers and make sure it gets 
   *  appropriate initialization/catch-up messages.
   * @param {websocketConnection} ws
   */
  function onConnect(ws){
    //add the new client to our list of connections
    logger.info('adding connection');
    wsConnections.push(ws);

    //send it current configs
    ws.send(configer.getConfigString());
    
    ws.on('message', gotMessage.bind(ws));
  
    //when the connection is closed
    ws.on('close', function(ws){
      //remove it from the list of active connections
      for(var wsI = wsConnections.length - 1;
          wsI >= 0;
          wsI--){
        var connection = wsConnections[wsI];
        if (connection === ws){
          logger.info('removing connection');
          wsConnections.splice(wsI, 1);
        } else if (connection.readyState === WebSocket.CLOSED){
          logger.info('cleaning up connection');
          wsConnections.splice(wsI, 1);
        }
      }
    });
  }
  
  //when a new websocket client connects, call the appropriate handler
  wss.on('connection', onConnect);
};

module.exports = Websockets;
