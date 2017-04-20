var review = function( data, configHandler ){

  var haveShownShare = false;
  var soundTimeout;
  var soundPlayer;

  /**
   * After the video has played through once,
   *  trigger share UI or just go to "thank you" screen
   */
  function onTimeupdate(){
    //if the video has finished
    if ( this.currentTime >= this.duration ){
      //if we are offering e-mail sharing
      if (configHandler.get('showLocalShare')){
        var vidElem = document.getElementById('videoReview');
        //if we have not shown the e-mail option yet
        if (haveShownShare === false ){
          //remember that we have shown it
          haveShownShare = true;
          //transition in the other UI elements
          var container = document.getElementById('videoReviewContainer');
          container.classList.add('share');
          var btn = document.getElementById('breakButton');
          btn.classList.remove('enabled');
          btn.classList.add('disabled');
          vidElem.muted = true;
          //play the audio after the e-mail option
          // has transitioned in
          if (soundPlayer.exists()){
            soundTimeout = setTimeout(function(){
              soundPlayer.play();
            }, 1000);
          }
        }
        //replay the video
        vidElem.currentTime = 0;
        vidElem.play();
      } else {
        //if we are not offering e-mail sharing
        // just transition to the thank you screen
        window.events.dispatchEvent(new Event('special'));
      }
    }
  }

  /**
   * Set the video to play back
   */
  function setVideo(e){
    console.log('loading video');

    var vidElem = document.getElementById('videoReview');
    vidElem.src = 'output/performance/' + e.detail;
    vidElem.load();
  }

  window.addEventListener('videoRecorded', setVideo);

  this.enter = function(/*evt*/){
    console.log('playing video');
    var vidElem = document.getElementById('videoReview');
    vidElem.muted = false;
    vidElem.play();
    vidElem.addEventListener('timeupdate', onTimeupdate);
    haveShownShare = false;

    if (soundPlayer === undefined){
      soundPlayer = new SoundPlayer();
      soundPlayer.setup('vo_' + data.name);
    }
  };

  this.exit = function(/*evt*/){
    var vidElem = document.getElementById('videoReview');
    //pause video playback
    vidElem.pause();
    vidElem.removeEventListener('timeupdate', onTimeupdate);
    //stop audio playback
    soundPlayer.stop();
    clearTimeout(soundTimeout);
    //trigger cleanup after screen animates out
    setTimeout( cleanup, 1500);
  };

  /**
   * Reset the UI so the video is fullscreen again
   */
  function cleanup() {
    var container = document.getElementById('videoReviewContainer');
    container.classList.remove('share');
  }
};
