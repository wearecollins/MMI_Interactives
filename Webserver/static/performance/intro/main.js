var intro = function(/* data, configHandler */){

  var soundPlayer = new SoundPlayer();
  var soundTimeout;

  this.enter = function(/*evt*/){

    // if VO is not commented out, play it!
    soundPlayer.setup('vo_grab');
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
