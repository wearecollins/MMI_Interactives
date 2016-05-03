var perform = function(data, configHandler){
	var videos = data.videos;
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

	window.addEventListener("clipSelected", setClip);

  // alpha countdown
  var cdOne = null, 
  cdTwo = null, 
  cdThree = null;

	// 0 = start, 1 = practice, 2 = perform
	var state = 0;

  // current name
  var name = 0;

  /**
   * Enter: called automatically when page builds in
   */
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

    // setup current name
    var index = configHandler.get('currentName', 0);
    index++;
    
    // this could be reset daily, or just when it hits
    // a threshold
    if ( index > 1000 ){
      index = 0;
    }
    configHandler.set({'currentName':index});
    name = index;

		// timeout 1 - "get ready" -> countdown
    // extra 1000 = placeholder for global transition duration 
		setTimeout( function(){ startCountdown(false); }, 1000 + 500);

    	var videoDiv = document.getElementById("perf_"+currentClip.name);
    	videoDiv.onended = function(){

    		switch( state ){
    			case 1:
    			{
    				startCountdown(true);
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

  var countdownInterval = null;

  function startCountdown( shootVideo ){
    MMI.hide( "performReady" );
    MMI.show(("countdownContainer"), "flex");
    // MMI.show(("c_three"), "flex");

    var videoDiv = document.getElementById("perf_"+currentClip.name);

    cdThree.play(function(){
      console.log("done!");
      cdTwo.play(function(){
        cdOne.play(function(){
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
          }

          videoDiv.play();
        });
      });
    });

    // countdownInterval = setTimeout(function(){
    //   MMI.hide(("c_three"));
    //   MMI.show(("c_two"), "flex");

    //   countdownInterval = setTimeout(function(){
    //     MMI.hide(("c_two"));
    //     MMI.show(("c_one"), "flex");

    //     countdownInterval = setTimeout(function(){
    //       MMI.hide(("c_one"));

    //       state++;

    //       if ( shootVideo ){
	   //        // this tells OF to capture
	   //        window.events.dispatchEvent(new CustomEvent('record_video', {detail:currentClip.name}));
    //       }

    //       videoDiv.play();

    //     }.bind(this), 1000);
    //   }.bind(this), 1000);
    // }.bind(this), 1000);
  }

  this.exit = function(/*evt*/){
  	manager.getStreamHandler().hideStream();
    try {
      var videoDiv = document.getElementById("perf_"+currentClip.name);
      videoDiv.pause();

      // just in case
      cdThree.stop();
      cdTwo.stop();
      cdOne.stop();
    } catch(e){
      
    }
  }
};
