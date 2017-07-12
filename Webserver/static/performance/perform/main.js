var perform = function(data, configHandler){
  // Localize data
  var videos = data.videos;
  
  /**************************************************
    Section: Set which clip we're performing
  **************************************************/

  var countdownTimeout = null;
  var transitionTimeout = null;
  var cancelCountdown = false;
  var currentClip = null;
  var voPlaying = false;
  var pageLoaded = false;

  /**
   * Set the active clip to play for audio feedback
   */
  function setClip(e){
    for ( var i in videos ){
      var v = videos[i];
      if ( v.name == e.detail ){
        currentClip = videos[i];
        break;
      }
    }
  }

  function startVO(){
    voPlaying = true;
    log.debug("[Performance::Perform::startVO]");
  }

  function finishVO(){
    voPlaying = false;
    log.debug("[Performance::Perform::finishVO]");
    checkContinue();
  }

  function checkContinue(){
    if (!voPlaying && pageLoaded){
      log.debug("[Performance::Perform::checkContinue] continuing");
      var t = document.getElementById('performPractice');

      //If there is a Practice VO, 
      // then start the countdown after the VO plays
      if ( soundPractice.exists() ){
        soundPractice.play( function(){
          //once the VO finishes, animate the text to the corner
          t.classList.add('watermark');
          //and after the text animation finishes, start the countdown
          countdownTimeout = setTimeout(function(){
            startCountdown(false);
          },
          1000);
        });
      }

      //Otherwise, if there is no Practice VO,
      // start countdown after a short delay
      else {
        
        //animate text to corner
        t.classList.add('watermark');
        //start countdown after text animates away
        countdownTimeout = setTimeout(function(){
          startCountdown(false);
        },
        1000);

      }
    } else {
      log.debug("[Performance::Perform::checkContinue] not ready");
    }
  }

  // this event comes from the 'select' state
  window.addEventListener('clipSelected', setClip);
  window.addEventListener('startSelectVO', startVO);
  window.addEventListener('finishSelectVO', finishVO);

  function firstLoad(){
    setStaticWatermark(document.getElementById('performPractice'));
    setStaticWatermark(document.getElementById('performPerform'));
  }

  function setStaticWatermark(elem){
    elem.addEventListener('animationend', function(e){
      //replace the watermark animation with a static watermark definition
      // In Safari, the Animation was re-triggering 
      // when the Page was marked disabled
      e.target.classList.remove('watermark');
      e.target.classList.add('staticWatermark');
    });
  }

  firstLoad(); 

  /**************************************************
    Section: Main variables
  **************************************************/

  // 0 = start, 1 = practice, 2 = perform
  var state = 0;

  // current name
  var name = 0;

  // voiceovers
  var soundPractice = new SoundPlayer(),
      soundPerform = new SoundPlayer(),
      soundCountdown = new SoundPlayer();

  var cdDiv = document.getElementById('countdownNumber');
  cdDiv.addEventListener( 'animationend', continueCountdown);

  /**************************************************
   * Enter: called automatically when page builds
  **************************************************/

  this.enter = function performEnter(/*evt*/){
    state = 0;

    // show camera if streaming
    var doStream = configHandler.get('doStream', false);
    if (doStream == 'true' || doStream == true ){
      manager.getStreamHandler().showStream();
    }

    // this tells OF to switch cameras
    window.events.dispatchEvent(new Event('camera_front'));

    // setup current unique name
    name = getName();

    // -----------------------------------------------
    // Kickoff build / events
    
    // build VOs first time
    if (!soundPractice.exists()){
      soundPractice.setup('vo_practice');
      soundPerform.setup('vo_perform');
      soundCountdown.setup('snd_countdown');
    }

    MMI.hide( 'performPerform' );
    MMI.show( 'performPractice', 'block' );
    var t = document.getElementById('performPractice');
    t.classList.remove('watermark');
    t.classList.remove('staticWatermark');

    transitionTimeout = setTimeout(function(){
      pageLoaded = true;
      checkContinue();
    }, 2000);

    // -----------------------------------------------
    // Setup Videoplayer: once it ends, go to next state

    var videoDiv = getVideoDiv();//document.getElementById('perf_'+currentClip.name);

    videoDiv.onended = videoEnded.bind(this);

  };

  function getVideoDiv(){
    //we are going to try re-using the video clips already in the preview screen
    // instead of loading our own set of videos
    return document.getElementById(/*'perf_'*/'preview_'+currentClip.name);
  }

  /**
   * Called when the audio-source video finishes playing.
   * If in state 1, transition to performance mode
   * If in state 2, exit screen
   */
  function videoEnded(){
    log.info("[Performance::Perform::videoEnded] state " + state);
    switch( state ){
      case 1:
        // same as above: see if VO exists, and either
        // a) play it and wait or b) set a timeout to
        // start the countdown again
        MMI.hide( 'performPractice');
        MMI.show( 'performPerform', 'block' );
        var t = document.getElementById('performPerform');
        t.classList.remove('watermark');
        t.classList.remove('staticWatermark');

        // a) VO
        if ( soundPerform.exists() ){
          // play takes a 'onComplete' parameter,
          // so countdown will automatically occurr after VO
          // 
          soundPerform.play( function(){
            //after sound plays, animate text to corner
            t.classList.add('watermark');
            //remove 'start over' button from view for Performance time
            var btn = document.getElementById('breakButton');
            btn.classList.remove('enabled');
            btn.classList.add('disabled');
            //once text is done animating, start countdown
            countdownTimeout = setTimeout(function(){
              startCountdown(true);
            },
            1000);
          });

        // b) timeout
        } else {
          //if there is no VO, then just let text dwell a moment 
          // before animating away
          countdownTimeout = setTimeout( 
            function(){ 
              t.classList.add('watermark');
              //remove 'start over' button from view for Performance time
              var btn = document.getElementById('breakButton');
              btn.classList.remove('enabled');
              btn.classList.add('disabled');
              //start the countdown after the watermark animates up
              countdownTimeout = setTimeout(function(){
                startCountdown(true);
              },
              1000);
            }, 1000
          );
        }
        break;

      case 2:
        //we are done with both stages
        // so just go to next screen
        window.events.dispatchEvent( new Event('next') );
        break;
    }
  }

  /**
   * Get the unique name for this recording.
   * This will also update the persistent storage
   * with the next unique name in the sequence.
   * @returns {Number} the current name to use
   */
  function getName(){
    var index = configHandler.get('currentName', 0);
    index++;
    
    // this could be reset daily, or just when it hits
    // a threshold
    if ( index > 1000 ){
      index = 0;
    }

    if ( index.length == 1 ){
      index = '000' + index;
    } else if ( index.length == 2 ){
      index = '00' + index;
    } else if ( index.length == 3 ){
      index = '0' + index;
    }
    
    configHandler.set({'currentName':index});
    return index;
  }

  /**************************************************
   * Start 3-2-1 Countdown
  **************************************************/

  /**
   * Decrements the countdown number 
   *  or triggers the 'countdown finished' logic
   */
  function continueCountdown(){
    //the current countdown number (which just finished fading out)
    var countdownNum = Number.parseInt(cdDiv.innerText);
    //the next countdown number to show
    countdownNum--;
    //if the next countdown number is 0, then we are done counting down
    if (countdownNum === 0){
      finishCountdown();
    } else {
      //otherwis, play the countdown sound, and show the next number
      soundCountdown.play();
      cdDiv.innerText = ('' + countdownNum);
      //remove & re-add the CSS class to re-trigger CSS animation
      cdDiv.classList.remove('countdownFade');
      countdownTimeout = setTimeout(function(){
        if (!cancelCountdown){
          cdDiv.classList.add('countdownFade');
        }
      }, 200);
    }
  }

  /**
   * Start countdown (practice and perform)
   */
  function startCountdown(){
    MMI.show('countdownContainer', 'flex');

    //reset video to beginning here, 
    // I was having some issues in Safari playing the video,
    // and though maybe it was related to currentTime/play timing
    getVideoDiv().currentTime = 0;

    cancelCountdown = false;
    //get countdown from touchpoint config.
    // add one because continueCountdown() starts by subtracting one.
    cdDiv.innerText = parseInt(configHandler.get('countdownTime', 3)) + 1;
    continueCountdown();
  }

  /**
   * triggers audio playback, and video recording if appropriate
   */ 
  function finishCountdown(){
    var videoDiv = getVideoDiv();//document.getElementById('perf_'+currentClip.name);

    // hide the countdown, then either setup 'practice' or 'perform'
    MMI.hide(('countdownContainer'), 'flex');
    state++;
    var shootVideo = (state == 2);
    log.debug("[Performance::Perform::finishCountdown] recording: " + shootVideo);

    if ( shootVideo ){
      var detail = {
        'detail':{
          'clip':currentClip.name,
          'name':''+name
        }
      };
      // this tells OF to capture
      window.events.dispatchEvent(new CustomEvent('record_video', detail));

      // video plays in OF to match up sound better
      videoDiv.volume = 0;

    } else {
      videoDiv.volume = 1;
    }

    // play bg video, which gets 'oncomplete'
    // from this.enter() going
    videoDiv.play();

    log.debug("[Performance::Perform::finishCountdown] started video");
  }

  /**************************************************
    Exit: called automatically when page closes
  **************************************************/

  this.exit = function performExit(/*evt*/){
    manager.getStreamHandler().hideStream();
    try {
      var videoDiv = getVideoDiv();//document.getElementById('perf_'+currentClip.name);
      videoDiv.pause();

      // just in case, cancel any untriggered timeouts
      clearTimeout(countdownTimeout);
      clearTimeout(transitionTimeout);
      cancelCountdown = true;
      // stop any audio that might still be playing
      soundPractice.stop();
      soundPerform.stop();
    } catch(e){
      //empty
    }
  };
};
