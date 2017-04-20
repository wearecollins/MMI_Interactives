var intro = function(/* data, configHandler */){

  var soundPlayer;
  var soundTimeout;

  this.enter = function(/*evt*/){

    //the first time we come to this screen
    // initialize the sound player
    if (soundPlayer === undefined){
      soundPlayer = new SoundPlayer();
      soundPlayer.setup('vo_grab');
    }
    
    // if VO is not commented out, play it!
    if ( soundPlayer.exists() ){

      //wait for the screen to transition in before starting VO
      soundTimeout = setTimeout(function(){
        soundPlayer.play();
      }, 1000);
    }
  };

  this.exit = function(/*evt*/){
    //don't play the audio if it has not started already
    clearTimeout(soundTimeout);
    //or stop the audio if it already started
    soundPlayer.stop();
  };
};
