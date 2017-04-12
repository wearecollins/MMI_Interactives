var overview = function( data, configHandler){

  var soundPlayerA = null, 
      soundPlayerB = null;
  var soundTimeout;

  this.enter = function(/*evt*/){

    // show camera if streaming
    var doStream = configHandler.get('doStream', false);
    if (doStream == 'true' || doStream == true ){
      manager.getStreamHandler().showStream();
    }
    
    // this tells OF to switch cameras
    window.events.dispatchEvent(new Event('camera_front'));

    //initialize the VOs if they have not been yet
    if ( soundPlayerA === null ){
      soundPlayerA = new SoundPlayer();
      soundPlayerB = new SoundPlayer();

      soundPlayerA.setup('camera_front');
      soundPlayerB.setup('camera_side');
    }

    // trigger the first VO after the screen finished animating in
    soundTimeout = setTimeout(function(){
      if ( soundPlayerA.exists() ){
        //play the first VO, and change camera angles after it finishes
        soundPlayerA.play( showSideCamera );
      }
    }, 1000);
  };

  /**
   * Show the other camera angle and trigger the next VO
   */
  function showSideCamera(){

    // this tells OF to switch cameras
    window.events.dispatchEvent(new Event('camera_side'));
    
    //if there is a second VO, play it
    // otherwise just go to the next screen
    if ( soundPlayerB.exists() ){
      //play the second VO, and when it finishes, go to the next screen
      soundPlayerB.play( next );
    } else {
      next();
    }
  }

  /**
   * Go to the next screen
   */
  function next(){
    window.events.dispatchEvent( new Event('next') );
  }

  this.exit = function(/*evt*/){

    //if the VO has not started playing yet, cancel the timeout
    clearTimeout(soundTimeout);
    //stop sounds if they have started playing
    soundPlayerA.stop();
    soundPlayerB.stop();

    //hide the camera feed, and reset to front camera,
    // after this screen transitions out
    setTimeout(function(){
      manager.getStreamHandler().hideStream();
      window.events.dispatchEvent(new Event('camera_front'));
    }, 1000);

  };
};
