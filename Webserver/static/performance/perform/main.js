var perform = function(data, configHandler){
  // Localize data
	var videos = data.videos;
  
  /**************************************************
    Section: Set which clip we're performing
  **************************************************/

	var currentClip = null;

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
	window.addEventListener("clipSelected", setClip);

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

  // timeouts
  var timeouts = [];

  var cdDiv = document.getElementById('countdownNumber');
  cdDiv.addEventListener( 'animationend', continueCountdown);

  /**************************************************
   * Enter: called automatically when page builds
  **************************************************/

	this.enter = function(/*evt*/){
		state = 0;

		// show camera if streaming
		var doStream = configHandler.get('doStream', false);
    if (doStream == "true" || doStream == true ){
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
      index = "000" + index;
    } else if ( index.length == 2 ){
      index = "00" + index;
    } else if ( index.length == 3 ){
      index = "0" + index;
    }
    
    configHandler.set({'currentName':index});
    name = index;

    // -----------------------------------------------
    // Kickoff build / events
    
    // build VOs
    soundPractice.setup("vo_practice");
    soundPerform.setup("vo_perform");
    soundCountdown.setup("snd_countdown");

    MMI.hide( 'performPerform' );
    MMI.show( "performPractice", "block" );
    var t = document.getElementById('performPractice');
    t.classList.remove('watermark');

    // Option 1: VO -- Show 'get ready', start countdown after VO
    
    if ( soundPractice.exists() ){
      // wait for animate in
      setTimeout(function(){
        // play takes a 'onComplete' parameter,
        // so countdown will automatically occurr after VO
        soundPractice.play( function(){
          //var t = document.getElementById('performPractice');
          t.classList.add('watermark');
            //MMI.hide( "performPractice" );
            setTimeout(function(){
              startCountdown(false);
            },
            1000);
        });
      }, 1000)
    } 

    // Option 2: VO -- No VO, just go into countdown 
    // after we're done animating

    else {
      // timeout 1 - "get ready" -> countdown
      setTimeout( 
        function(){
          //var t = document.getElementById('performPractice');
          t.classList.add('watermark');
          //MMI.hide( "performPractice" );
            setTimeout(function(){
              startCountdown(false);
            },
            1000);
        }, 
        1000 + 500
      );
      // ^ extra 1000 = global transition duration 

      timeouts.push(t);
    }

    // -----------------------------------------------
    // Setup Videoplayer: once it ends, go to next state

  	var videoDiv = document.getElementById("perf_"+currentClip.name);

  	videoDiv.onended = function(){
  		switch( state ){
  			case 1:
  			{
          // same as above: see if VO exists, and either
          // a) play it and wait or b) set a timeout to
          // start the countdown again
          MMI.hide( 'performPractice');
          MMI.show( "performPerform", "block" );
          var t = document.getElementById('performPerform');
          t.classList.remove('watermark');

          // a) VO
          if ( soundPerform.exists() ){
            // play takes a 'onComplete' parameter,
            // so countdown will automatically occurr after VO
            // 
            soundPerform.play( function(){
                t.classList.add('watermark');
                //MMI.hide( "performPerform" );
                setTimeout(function(){
                  startCountdown(true);
                },
                1000);
            });

          // b) timeout
          } else {
            setTimeout( 
              function(){ 
                t.classList.add('watermark');
                //MMI.hide( "performPerform" );
                setTimeout(function(){
                  startCountdown(true);
                },
                1000);
              }, 1000
            );
          }
  			}
  			break;

  			case 2:
  			{
          window.events.dispatchEvent( new Event("next") );
  			}
  			break;
  		}

  	}.bind(this)

	} 
  //end this.enter()

  /**************************************************
   * Start 3-2-1 Countdown
  **************************************************/

  var countdownInterval = null;
  var countdownTimeout = null;
  var cancelCountdown = false;

  function continueCountdown(){
    var countdownNum = Number.parseInt(cdDiv.innerText);
    countdownNum--;
    if (countdownNum === 0){
      finishCountdown();
    } else {
      soundCountdown.play();
      cdDiv.innerText = ('' + countdownNum);
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
   * @param  {Boolean} shootVideo Tell OF to start recording (or not, just practicing)
   */
  function startCountdown( shootVideo ){
    MMI.show(("countdownContainer"), "flex");

    cancelCountdown = false;
    cdDiv.innerText = '' + 4;
    continueCountdown();
  }

    
  function finishCountdown(){

    var videoDiv = document.getElementById("perf_"+currentClip.name);
    // hide self, then either setup 'practice' or 'perform'

    MMI.hide(("countdownContainer"), "flex");
    state++;
    var shootVideo = (state == 2);

    if ( shootVideo ){
      var detail = {
        "detail":{
          "clip":currentClip.name,
          "name":""+name
        }
      }
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

  this.exit = function(/*evt*/){
  	manager.getStreamHandler().hideStream();
    try {
      var videoDiv = document.getElementById("perf_"+currentClip.name);
      videoDiv.pause();

      // just in case
      clearTimeout(countdownTimeout);
      cancelCountdown = true;
      soundPractice.stop();
      soundPerform.stop();
    } catch(e){
      
    }
  }
};
