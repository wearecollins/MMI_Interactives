var overview = function( data, configHandler){
  this.enter = function(/*evt*/){

  	// show camera if streaming
    var doStream = configHandler.get('doStream', false);
    if (doStream == "true" || doStream == true ){
        manager.getStreamHandler().showStream();
    }
    
    // this tells OF to switch cameras
    window.events.dispatchEvent(new Event('camera_front'));

    // play sounds
    var soundA = document.getElementById("camera_front");
    var soundB = document.getElementById("camera_side");

    soundA.addEventListener("timeupdate", onTimeUpdateA);
    soundA.currentTime = 0;
    soundA.play();
  };

  function onTimeUpdateA( e ){
    // timeupdate
    if ( this.currentTime == this.duration ){
      showSideCamera();
    }
  }

  function onTimeUpdateB( e ){
    // timeupdate
    if ( this.currentTime == this.duration ){
      next();
    }
  }

  function showSideCamera(){
      var soundA = document.getElementById("camera_front");
      soundA.removeEventListener("timeupdate", onTimeUpdateA);

      // this tells OF to switch cameras
      window.events.dispatchEvent(new Event('camera_side'));
      var soundB = document.getElementById("camera_side");
      soundB.addEventListener("timeupdate", onTimeUpdateB);
      soundB.currentTime = 0;
      soundB.play();
  }

  function next(){
      window.events.dispatchEvent( new Event("next") );
      var soundB = document.getElementById("camera_side");
      soundB.removeEventListener("timeupdate", onTimeUpdateB);
  }

  this.exit = function(/*evt*/){
    var soundA = document.getElementById("camera_front");
    var soundB = document.getElementById("camera_side");
    
    soundA.pause();
    soundB.pause();
    soundA.currentTime = 0;
    soundB.currentTime = 0;

  	setTimeout(function(){
  		manager.getStreamHandler().hideStream();
		  window.events.dispatchEvent(new Event('camera_front'));
  	}, 1000);
  	
    var soundA = document.getElementById("camera_front");
    soundA.removeEventListener("ended", showSideCamera);
    var soundB = document.getElementById("camera_side");
    soundB.removeEventListener("ended", next);

  	//stop sounds
  	
  	//todo: fade out sound ;)
  };
};
