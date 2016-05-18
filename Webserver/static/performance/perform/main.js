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

  // alpha countdown
  var cdOne = null, 
  cdTwo = null, 
  cdThree = null;

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

  /**************************************************
   * Enter: called automatically when page builds
  **************************************************/

	this.enter = function(/*evt*/){
		state = 0;

    // build countdown videos
    if (cdOne == null ){
      cdOne = new AlphaVideo();
      cdOne.setup("countdownInput","countdownOutput", "c_one_v", 600, 600);
      cdTwo = new AlphaVideo();
      cdTwo.setup("countdownInput","countdownOutput", "c_two_v", 600, 600);
      cdThree = new AlphaVideo();
      cdThree.setup("countdownInput","countdownOutput", "c_three_v", 600, 600);
    }

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

    MMI.show( "performPractice", "block" );

    // Option 1: VO -- Show 'get ready', start countdown after VO
    
    if ( soundPractice.exists() ){
      // wait for animate in
      setTimeout(function(){
        // play takes a 'onComplete' parameter,
        // so countdown will automatically occurr after VO
        soundPractice.play( function(){
            MMI.hide( "performPractice" );
            startCountdown(false); 
        });
      }, 1000)
    } 

    // Option 2: VO -- No VO, just go into countdown 
    // after we're done animating

    else {
      // timeout 1 - "get ready" -> countdown
      var t =setTimeout( 
        function(){
          MMI.hide( "performPractice" );
          startCountdown(false); 
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

          MMI.show( "performPerform", "block" );

          // a) VO
          if ( soundPerform.exists() ){
            // play takes a 'onComplete' parameter,
            // so countdown will automatically occurr after VO
            // 
            soundPerform.play( function(){
                MMI.hide( "performPerform" );
                startCountdown(true); 
            });

          // b) timeout
          } else {
            setTimeout( 
              function(){ 
                MMI.hide( "performPerform" );
                startCountdown(true);
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

  /**
   * Start countdown (practice and perform)
   * @param  {Boolean} shootVideo Tell OF to start recording (or not, just practicing)
   */
  function startCountdown( shootVideo ){
    MMI.show(("countdownContainer"), "flex");

    var videoDiv = document.getElementById("perf_"+currentClip.name);

    // play cound sound
    soundCountdown.play();

    // play each countdown (alpha video)
    cdThree.play(function(){
      soundCountdown.play();
      cdTwo.play(function(){
        soundCountdown.play();
        cdOne.play(function(){

          // hide self, then either setup 'practice' or 'perform'

          MMI.hide(("countdownContainer"), "flex");
          state++;

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

        });
      });
    });
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
      cdThree.stop();
      cdTwo.stop();
      cdOne.stop();
      soundPractice.stop();
      soundPerform.stop();
    } catch(e){
      
    }
  }
};
