var perform = function(data){
	var videos = data.videos;
	var currentClip = null;

	function setClip(e){
		console.log("Set clip! "+e.detail);
		for ( var i in videos ){
			var v = videos[i];
			if ( v.name == e.detail ){
				currentClip = videos[i];
				break;
			}
		}
	}

	window.addEventListener("clipSelected", setClip);

	// 0 = start, 1 = practice, 2 = perform
	var state = 0;

	this.enter = function(/*evt*/){
		state = 0;

		// show camera if streaming
		var doStream = MMI.getQueryString("stream", false);
		if (doStream == "true" ){
		    manager.getStreamHandler().showStream();
		}

		// this tells OF to switch cameras
		window.events.dispatchEvent(new Event('camera_front'));

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


  function show( id, display ){
  	var div = document.getElementById(id);
    div.style.visibility = "visible";
    div.style.display = display;
  }

  function hide( id ){
  	var div = document.getElementById(id);
    div.style.visibility = "hidden";
    div.style.display = "none";
  }

  var countdownInterval = null;

  function startCountdown( shootVideo ){
	hide( "performReady" );
    show(("countdownContainer"), "flex");
    show(("c_three"), "flex");

    var videoDiv = document.getElementById("perf_"+currentClip.name);

    console.log( videoDiv );

    countdownInterval = setTimeout(function(){
      hide(("c_three"));
      show(("c_two"), "flex");

      countdownInterval = setTimeout(function(){
        hide(("c_two"));
        show(("c_one"), "flex");

        countdownInterval = setTimeout(function(){
          hide(("c_one"));

          state++;

          if ( shootVideo ){
	          // this tells OF to capture
	          window.events.dispatchEvent(new CustomEvent('record_video', {detail:currentClip.name}));
          }

          videoDiv.play();

        }.bind(this), 1000);
      }.bind(this), 1000);
    }.bind(this), 1000);
  }

  this.exit = function(/*evt*/){
  	manager.getStreamHandler().hideStream();
  }
};
