/**
 * @constructor
 */
function EventHandler(){
  var activeTimeouts = [];
  var stateHandler;
  var jsonNotifiers = [];
  var configHandler;

  this.init = function init(a_stateHandler, a_configHandler){
    stateHandler = a_stateHandler;
    configHandler = a_configHandler;
    registerAllEvents();
    document.body.onkeydown = handlekey;
    //make this globally accessible, and an easy replacement for
    // window.dispatchEvent
    window.events = this;
  };

  /**
   * adds a function to be called when events are raised
   * @param {jsonNotifier} func 
   */
  this.addJsonNotifier = function addJsonNotifier(func){
    if (typeof(func) === 'function'){
      jsonNotifiers.push(func);
    }
  };

  this.handleJson = function handleJson(msg){
    var data;
    try{
      data = JSON.parse(msg);
    }catch(e){
      log.error('[EventHandler::handleJson] error parsing', msg, e);
      return;
    }
    //if this is an event message
    if (data.event !== undefined){
      //trigger the event
      var evt;
      if (data.event.detail){
        evt = new CustomEvent(data.event.name, {detail:data.event.detail});
      } else {
        evt = new Event(data.event.name); 
      }
      window.dispatchEvent(evt);
    }
  };

  this.dispatchEvent = function dispatchEvent(evt){
    var message = {event:{name:evt.type, detail:evt.detail}};
    for(var notifierI = jsonNotifiers.length - 1;
        notifierI >= 0;
        notifierI--){
      jsonNotifiers[notifierI](message);
    }
    window.dispatchEvent(evt);
  };

  function registerAllEvents(){
    var events = ['next','prev','cancel','admin'];
    for(var eventI = events.length - 1;
        eventI >= 0;
        eventI--){
      var eventType = events[eventI];
      registerEvent(eventType);
    }
  }

  function handleEvent(eventType, evt){
    //clean up timeouts
    while(activeTimeouts.length > 0){
      clearTimeout(activeTimeouts.pop());
    }
    document.body.classList.remove('timingOut');

    //do state transition
    stateHandler.handleAction(eventType, evt);
  
    //set up timeouts
    if (!(stateHandler.disabledTimeout())){
      var timeoutTime = configHandler.get('timeout', 30);
      activeTimeouts.push(
        setTimeout(
          function(){
            window.events.dispatchEvent(new Event('cancel'));
          }, 
          timeoutTime * 1000));
      activeTimeouts.push(
        setTimeout(
          function(){
            document.body.classList.add('timingOut');
          },
          Math.max(1, (timeoutTime - 5)) * 1000));
    }
  }
  
  function registerEvent(eventType){
    window.addEventListener(eventType, handleEvent.bind(this, eventType));
  }

  function handlekey(evt){
    var key = evt.keyCode || evt.which;
    var keychar = String.fromCharCode(key);
    if (keychar === 'a' || keychar === 'A') {
      // window.events.dispatchEvent(new Event('admin'));
    }
    // DEBUG
    if ( keychar == 'N' || keychar == 'H' ){
      window.events.dispatchEvent(new Event('next'));
    }
  }
}
