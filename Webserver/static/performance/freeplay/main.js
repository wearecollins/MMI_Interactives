var freeplay = function(data, configHandler){
  this.enter = function(){

    // show camera if streaming
    var doStream = configHandler.get('doStream', false);
    if (doStream == 'true' || doStream == true ){
      manager.getStreamHandler().showStream();
    }
    
  };
  this.exit = function(){
    manager.getStreamHandler().hideStream();
  };
};
