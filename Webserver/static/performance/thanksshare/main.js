var thanksshare = function(data, configHandler){

  var soundPlayer;
  var soundTimeout;
  var nextTimeout;

  this.enter = function(/*evt*/){

    //the first time we come to this screen
    // initialize the sound player
    if (soundPlayer === undefined){
      soundPlayer = new SoundPlayer();
      soundPlayer.setup('vo_' + data.name);
    }

    //if the audio clip isn't commented out
    if (soundPlayer.exists()){
      //play it after the screen finishes 
      // transitioning in
      soundTimeout = setTimeout(function(){
        soundPlayer.play(setupExit);
      }, 1000);
    } else {
      //if there is no audio clip to play
      // just set up the exit transition
      setupExit();
    }
  };

  function setupExit(){
    var timeoutTime = getTimeout(5000);

    //auto-next after short delay
    nextTimeout = setTimeout(function(){
      window.events.dispatchEvent(new Event('next'));
    }, timeoutTime);
  }

  /**
   *  Get this page's timeout based on what is configured
   *  @param {number} default 
   *                  The default timeout to use if nothing is configured
   */
  function getTimeout(time){
    var cTime = configHandler.get('thanksTimeout', 0);
    if (cTime){
      //convert from seconds to millis
      return cTime * 1000;
    } else {
      return time;
    }
  }

  this.exit = function(/*evt*/){
    clearTimeout(nextTimeout);
    clearTimeout(soundTimeout);
    soundPlayer.stop();
  };
};
