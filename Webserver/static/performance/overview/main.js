var overview = function(/*manager*/){
  this.enter = function(/*evt*/){

  	// show camera if streaming
    var doStream = MMI.getQueryString("stream", false);
    if (doStream == "true" ){
        manager.getStreamHandler().showStream();
    }
    
    // this tells OF to switch cameras
    window.dispatchEvent(new Event('camera_front'));

    // play sounds
    var soundA = document.getElementById("camera_front");
    var soundB = document.getElementById("camera_side");
    soundA.onended = function(){
        // this tells OF to switch cameras
        window.dispatchEvent(new Event('camera_side'));

    	soundB.onended = function(){
    		window.dispatchEvent( new Event("next") );
    	}.bind(this)
    	soundB.play();
    }.bind(this);

    soundA.play();
    console.log(soundA);
  };
  this.exit = function(/*evt*/){
    var soundA = document.getElementById("camera_front");
    var soundB = document.getElementById("camera_side");
    
    soundA.onended = "";
    soundB.onended = "";

    soundA.pause();
    soundB.pause();
    soundA.currentTime = 0;
    soundB.currentTime = 0;

  	setTimeout(function(){
  		manager.getStreamHandler().hideStream();
		window.dispatchEvent(new Event('camera_front'));
  	}, 1000);
  	
  	//stop sounds
  	
  	//todo: fade out sound ;)
  };
};
