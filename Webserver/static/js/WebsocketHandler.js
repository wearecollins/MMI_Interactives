/**
 * handles communication with WebSocket servers.
 * @constructor
 */
function WebsocketHandler(){

  /** 
   * open connections
   * @type {WebSocket[]}
   */
  var websockets = [];
  /** 
   * functions to forward incoming binary data to
   * @type {function[]}
   */ 
  var binaryHandlers = [];
  /**
   * functions to forward incoming text data to
   * @type {function[]}
   */
  var textHandlers = [];
  /**
   * number of milliseconds to wait between attempting reconnects
   * @type {number}
   */
  var reconnectDelay = 3 * 1000;
  /**
   * the current state message to update all new connections
   * @type {string|ArrayBuffer}
   */
  var storedMessage;

  /**
   * Connects to the specified WebSocket server.
   *  Can be called multiple times to connect to more than one server.
   *  Will attempt reconnect if the server cannot be reached or
   *  if the connection is closed for any reason.
   * @param {string} url URL of the WebSocket server to connect to.
   * @param {string} [name]
   *  identifying name for this connection. Will be provided as 
   *  an argument when forwarding messages coming from this connection.
   */
  this.connect = function connect(url, name){
    var self = this;
    var ws = new WebSocket(url);
    //receive binary data as an arraybuffer
    ws.binaryType = 'arraybuffer';
    //handle binary and text messages from server
    ws.onmessage = handleMessage.bind(ws, name);
    //handle reconnect logic
    ws.onclose = function(){
      removeWS(this);
      this.close();
      ws = undefined;
      setTimeout(self.connect.bind(self, url, name), reconnectDelay);
    };
    ws.onopen = function(){
      log.info('connected to',name,url);
      addWS(ws, name);
    };
  };

  /**
   * Sends a message to all connected servers.
   * @param {string|ArrayBuffer|*} message
   */
  this.send = function send(message){
    message = normalizeMessage(message);

    //send message to all connections
    for(var wsI = websockets.length - 1;
        wsI >= 0;
        wsI--){
      websockets[wsI].ws.send(message);
    }
  };

  /**
   * Sends a message to all currently-connected servers and stores the message
   *  for sending to new connections in the future. This will overwrite any
   *  previously stored message.
   * @param {string|ArrayBuffer|*} message
   */
  this.storeAndForward = function storeAndForward(message){
    message = normalizeMessage(message);
    storedMessage = message;
    //send message to all existing connections
    this.send(message);
  };

  /**
   * A callback for binary messages
   * @callback WebsocketHandler~binaryHandler
   * @param {ArrayBuffer} data the incoming message
   * @param {string} [name] 
   *  the name associated with the connection the data arrived on
   */

  /**
   * A callback for text messages
   * @callback WebsocketHandler~textHandler
   * @param {string} message the incoming message
   * @param {string} [name]
   *  the name associated with the connection the message arrived on
   */

  /**
   * registers a function to be forwarded any incoming Binary messages.
   * @param {WebsocketHandler~binaryHandler} func 
   */
  this.addBinaryHandler = function addBinaryHandler(func){
    binaryHandlers.push(func);
  };

  /**
   * registers a function to be forwarded any incoming Text messages.
   * @param {WebsocketHandler~textHandler} func 
   */
  this.addTextHandler = function addTextHandler(func){
    textHandlers.push(func);
  };

  /**
   * ensures the provided message is a string or ArrayBuffer.
   *  all other types are JSON-encoded into strings.
   * @param {string|ArrayBuffer|*} message
   * @returns {string|ArrayBuffer}
   */
  function normalizeMessage(message){
    //normalize Objects to JSON-encoded strings
    if (typeof(message) !== 'string' &&
        !(message instanceof ArrayBuffer)){
      //attempt to JSON-encode
      message = JSON.stringify(message);
    }
    return message;
  }


  /**
   * removes the provided WebSocket from the list of connections.
   * @param {WebSocket} ws WebSocket to remove.
   */
  function removeWS(ws){
    for(var wsI = websockets.length - 1;
        wsI >= 0;
        wsI--){
      if (websockets[wsI].ws === ws){
        websockets.splice(wsI, 1);
      }
    }
  }

  /**
   * adds the provided WebSocket to this list of connections.
   * @param {WebSocket} ws WebSocket to add.
   */
  function addWS(ws, name){
    websockets.push({ws, name});
    if (storedMessage !== undefined){
      ws.send(storedMessage);
    }
  }
  
  /**
   * notifies all registered binary message handlers.
   * @param {arraybuffer} buffer the message to forward
   * @param {string} [name] 
   *  the associated name of the connection the message came on.
   */
  function handleBinary(buffer, name){
    for(var handlerI = 0;
        handlerI < binaryHandlers.length;
        handlerI++){
      binaryHandlers[handlerI](buffer, name);
    }
  }

  /**
   * notifies all registered text message handlers.
   * @param {string} text the message to forward
   * @param {string} [name] 
   *  the associated name of the connection the message came on.
   */
  function handleText(text, name){
    for(var handlerI = 0;
        handlerI < textHandlers.length;
        handlerI++){
      textHandlers[handlerI](text, name);
    }
  }

  /**
   * handles messages coming from a WebSocket connection.
   * @param {string} [name] the associated name for the connection.
   * @param {Object} message the WebSocket message object.
   */
  function handleMessage(name, message){
    if (message.data instanceof ArrayBuffer){
      handleBinary(message.data, name);
    } else {
      handleText(message.data, name);
    }
  }
}
