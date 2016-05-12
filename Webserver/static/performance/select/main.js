var select = function(data){

	/**
	 * Voiceover: Will automatically play if it
	 * exists in template; will do nothing if 
	 * commented out in template!
	 * @type {SoundPlayer}
	 */
	var soundPlayer = null;

	var videos = data.videos;
	var videoDivs = [];
	var videoContainer;

	var clipIsSelected = false;

	/**************************************************
	* Enter: called automatically when page builds
	**************************************************/

	this.enter = function(){
		// show 'select a clip'
		MMI.show("selectText","flex");

		// setup VO
		if ( soundPlayer === null ){
			soundPlayer = new SoundPlayer();
			soundPlayer.setup("vo_select");
		}

		// setup initial states
		clipIsSelected = false;

		videoContainer = document.getElementById("videoContainer");
		if ( videoDivs.length == 0 ){
			for ( var i in videos ){
				var n = videos[i].name;

				videoDivs.push( 
				{
					"name":n,
					"index":i,
					"div":document.getElementById( n ),
					"overlay":document.getElementById( n +"_overlay" ),
					"big_video":document.getElementById( n +"_big_video" ),
					"big":document.getElementById( n +"_big" )
				} );
			}
		}

		// Setup chain of animations
		var overlay = document.getElementById("select_intro");
		overlay.classList.remove("disabled");

		// play voiceover
		if ( soundPlayer.exists() ){
			soundPlayer.play( function(){
				// trigger stuff, if you'd like
			});
		}

		// listen to buttons
		window.addEventListener("selectClip", selectClip );
		window.addEventListener("previewClip", previewClip );
	}


	/**************************************************
		Clip selection (move to next state)
	**************************************************/

	var showTimeout = null;
	var currentClip = "black_magic";

	function selectClip(){
		clipIsSelected = true;
		var evt = new CustomEvent("clipSelected", {detail:currentClip});
		window.events.dispatchEvent(evt);

		window.events.dispatchEvent(new Event("next"));
	}


	/**************************************************
		Clip preview
	**************************************************/

	var previewingClip = null,
	previewingThumb = null,
	previewingVideo = null;

	var buttonTimeout = null;

	function previewClip( e ){
		// stop VO if still playing]
		if ( soundPlayer.exists() ){
			soundPlayer.stop();
		}

		// hide 'select a clip'
		MMI.hide("selectText");

		clearTimeout(buttonTimeout);
		// hide buttons
		var b = document.getElementById("selectButtons");
		b.classList.remove("enabled");

		currentClip  = e.detail;
		var whichDiv = e.detail + "_big";
		var smDiv 	 = e.detail +"_overlay";
		var whichVid = e.detail + "_big_video";

		if (previewingClip){
			var b = document.getElementById(previewingClip);
			b.style.opacity = "0";
			var d = document.getElementById(previewingThumb);
			d.classList.add("disabled");
			var v = document.getElementById(previewingVideo);
			v.classList.add("disabled");
			mute( previewingVideo );
		}
		var b = document.getElementById(whichDiv);
		b.style.opacity = "1";
		var d = document.getElementById(smDiv);
		d.classList.remove("disabled");
		var v = document.getElementById(whichVid);
		v.currentTime = 0;
		unmute( whichVid );

		previewingThumb = smDiv;
		previewingClip = whichDiv;
		previewingVideo = whichVid;

		buttonTimeout = setTimeout(function(){
			var b = document.getElementById("selectButtons");
			b.classList.add("enabled");
		}, 1000);
	}

	/**************************************************
		Exit: called automatically when page closes
	**************************************************/

	this.exit = function(/*evt*/){
		clearTimeout(buttonTimeout);
		setTimeout(cleanup, 1000);

		// make sure we have a clip selected!
		if ( !clipIsSelected ){
			// selectClip();
			// clipIsSelected = true;
		}

		// stop VO if still playing]
		if ( soundPlayer.exists() ){
			soundPlayer.stop();
		}

		// remove listeners
		window.removeEventListener("selectClip", selectClip );
	}

	// cleanup after everything animates off page
	function cleanup() {
		hide("select_clips");
		show("select_intro");

		var btns = document.getElementById("selectButtons");
		btns.classList.remove("enabled");


		for ( var v in videoDivs ){
			mute(videoDivs[v].name);
			mute(videoDivs[v].name+"_big_video");

			var b = videoDivs[v].big;
			b.style.opacity = "0";

			var d = videoDivs[v].overlay;
			d.classList.add("disabled");
		}
	}

	// utils
	function show( id ){
		var d = document.getElementById(id);
		if (!d) return;
		d.style.display = "block";
		d.style.visibility = "visible";
	}

	function hide( id ){
		var d = document.getElementById(id);
		if (!d) return;
		d.style.display = "none";
		d.style.visibility = "hidden";
	}

	function mute( id ){
		var v = document.getElementById(id);
		if (!v) return;
		v.volume = 0;
	}

	function unmute( id ){
		var v = document.getElementById(id);
		if (!v) return;
		v.muted = false;
		v.volume = 1;
	}
};
