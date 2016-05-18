var overview = function( data, configHandler){

  var soundPlayerA = null, 
  soundPlayerB = null;

  this.enter = function(/*evt*/){

  	// show camera if streaming
    var doStream = configHandler.get('doStream', false);
    if (doStream == "true" || doStream == true ){
        manager.getStreamHandler().showStream();
    }
    
    // this tells OF to switch cameras
    window.events.dispatchEvent(new Event('camera_front'));

    if ( soundPlayerA === null ){
      soundPlayerA = new SoundPlayer();
      soundPlayerB = new SoundPlayer();

      soundPlayerA.setup("camera_front");
      soundPlayerB.setup("camera_side");
    }

    // play sounds
    // play after animate
    setTimeout(function(){
      if ( soundPlayerA.exists() ){
        soundPlayerA.play( showSideCamera );
      }
    }, 1000)
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
      // var soundA = document.getElementById("camera_front");
      // soundA.removeEventListener("timeupdate", onTimeUpdateA);

      // this tells OF to switch cameras
      window.events.dispatchEvent(new Event('camera_side'));
      // var soundB = document.getElementById("camera_side");
      // soundB.addEventListener("timeupdate", onTimeUpdateB);
      // soundB.currentTime = 0;
      // soundB.play();
      
      if ( soundPlayerA.exists() ){
        soundPlayerB.play( next );
      } else {
        next();
      }
  }

  function next(){
      window.events.dispatchEvent( new Event("next") );
      // var soundB = document.getElementById("camera_side");
      // soundB.removeEventListener("timeupdate", onTimeUpdateB);
  }

  this.exit = function(/*evt*/){
    // var soundA = document.getElementById("camera_front");
    // var soundB = document.getElementById("camera_side");
    
    // soundA.pause();
    // soundB.pause();
    // soundA.currentTime = 0;
    // soundB.currentTime = 0;

    //stop sounds
    soundPlayerA.stop();
    soundPlayerB.stop();

  	setTimeout(function(){
  		manager.getStreamHandler().hideStream();
		  window.events.dispatchEvent(new Event('camera_front'));
  	}, 1000);

  };
};
