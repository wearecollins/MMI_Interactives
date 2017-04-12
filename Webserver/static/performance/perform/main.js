var perform = function(data, configHandler){
  // Localize data
  var videos = data.videos;
  
  /**************************************************
    Section: Set which clip we're performing
  **************************************************/

  var countdownTimeout = null;
  var cancelCountdown = false;
  var currentClip = null;

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

  // this event comes from the 'select' state
  window.addEventListener('clipSelected', setClip);

  function firstLoad(){
    setStaticWatermark(document.getElementById('performPractice'));
    setStaticWatermark(document.getElementById('performPerform'));
  }

  function setStaticWatermark(elem){
    elem.addEventListener('animationend', function(e){
      //replace the watermark animation with a static watermark definition
      // In Safari, the Animation was re-triggering 
      // when the Page was marked disabled
      elem.classList.remove('watermark');
      elem.classList.add('staticWatermark');
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
      soundCountdown = new SoundPlayer(),
      soundTimeout;

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
    name = index;

    // -----------------------------------------------
    // Kickoff build / events
    
    // build VOs
    soundPractice.setup('vo_practice');
    soundPerform.setup('vo_perform');
    soundCountdown.setup('snd_countdown');

    MMI.hide( 'performPerform' );
    MMI.show( 'performPractice', 'block' );
    var t = document.getElementById('performPractice');
    t.classList.remove('watermark');

    //If there is a Practice VO, 
    // then start the countdown after the VO plays
    if ( soundPractice.exists() ){
      // wait for animate in
      soundTimeout = setTimeout(function(){
        // play takes a 'onComplete' parameter,
        // so countdown will automatically occurr after VO
        soundPractice.play( function(){
          //once the VO finishes, animate the text to the corner
          t.classList.add('watermark');
          //and after the text animation finishes, start the countdown
          countdownTimeout = setTimeout(function(){
            startCountdown(false);
          },
          1000);
        });
      }, 1000);
    }

    //Otherwise, if there is no Practice VO,
    // start countdown after a short delay
    else {
      //wait for the screen to animate in, plus a short dwell time
      countdownTimeout = setTimeout( 
        function(){
          //animate text to corner
          t.classList.add('watermark');
          //start countdown after text animates away
          countdownTimeout = setTimeout(function(){
            startCountdown(false);
          },
          1000);
        }, 
        1500
      );
      // ^ extra 1000 = global transition duration 

    }

    // -----------------------------------------------
    // Setup Videoplayer: once it ends, go to next state

    var videoDiv = document.getElementById('perf_'+currentClip.name);

    videoDiv.onended = function onended(){
      switch( state ){
        case 1:
          // same as above: see if VO exists, and either
          // a) play it and wait or b) set a timeout to
          // start the countdown again
          MMI.hide( 'performPractice');
          MMI.show( 'performPerform', 'block' );
          var t = document.getElementById('performPerform');
          t.classList.remove('watermark');

          // a) VO
          if ( soundPerform.exists() ){
            // play takes a 'onComplete' parameter,
            // so countdown will automatically occurr after VO
            // 
            soundPerform.play( function(){
              //after sound plays, animate text to corner
              t.classList.add('watermark');
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

    }.bind(this);

  };

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
    MMI.show(('countdownContainer'), 'flex');

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

    var videoDiv = document.getElementById('perf_'+currentClip.name);
    // hide self, then either setup 'practice' or 'perform'

    MMI.hide(('countdownContainer'), 'flex');
    state++;
    var shootVideo = (state == 2);

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

  }

  /**************************************************
    Exit: called automatically when page closes
  **************************************************/

  this.exit = function performExit(/*evt*/){
    manager.getStreamHandler().hideStream();
    try {
      var videoDiv = document.getElementById('perf_'+currentClip.name);
      videoDiv.pause();

      // just in case, cancel any untriggered timeouts
      clearTimeout(countdownTimeout);
      clearTimeout(soundTimeout);
      cancelCountdown = true;
      // stop any audio that might still be playing
      soundPractice.stop();
      soundPerform.stop();
    } catch(e){
      //empty
    }
  };
};
