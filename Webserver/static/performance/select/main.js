var select = function(data){

	var videos = data.videos;
	var videoDivs = [];
	var videoContainer;

	var clipIsSelected = false;

	this.enter = function(/*evt*/){
		clipIsSelected = false;

		videoContainer = document.getElementById("videoContainer");
		if ( videoDivs.length == 0 ){
			for ( var i in videos ){
				videoDivs.push( 
				{
					"index":i,
					"div":document.getElementById( videos[i].name )
				} );
			}
		}
		// show 'intro'
		var overlay = document.getElementById("select_intro");
		overlay.classList.remove("disabled");

		setTimeout(function(){
			showSelectCancel.bind(this)();
		}, 1500)

		// listen to buttons
		window.addEventListener("clip_up", prevClip );
		window.addEventListener("clip_down", nextClip );
		window.addEventListener("selectClip", selectClip );
	}

	function showSelectCancel(){
		overlay = document.getElementById("select_intro");
		overlay.classList.add("disabled");

		show("select_clips");
		var btns = document.getElementById("selectButtons");
		btns.classList.add("enabled");

		unmute( videos[1].name );
	}

	function prevClip(){
		// change order of array
		var v = videoDivs.pop();
		videoDivs.unshift(v);

		var v = videos.pop();
		videos.unshift(v);

		refreshClips(0);
	}

	function nextClip(){
		var v = videoDivs.shift();
		videoDivs.push(v);

		var v = videos.shift();
		videos.push(v);

		refreshClips(videoDivs.length-1);
	}

	var showTimeout = null;

	function refreshClips( first ){
		clearTimeout(showTimeout);
		var dontAnimate = first === undefined ? 0 : first;
		for ( var i in videoDivs ){
			videoDivs[i].div.volume = 0;
			videoDivs[i].div.play();

			var top = ( i - videoDivs[i].index) * (100/videoDivs.length);
			videoDivs[i].div.style.zIndex = i == 1 ? 2 : 0;

			if ( i == dontAnimate ){
				videoDivs[i].div.style["transition"] = "none";
				videoDivs[i].div.style["opacity"]	 = 0;
				showTimeout = setTimeout( function(d) {
					videoDivs[i].div.style["transition"] = "all ease-in-out .25s";
					d.style["opacity"] = 1;
				}, 250, videoDivs[i].div);
			} else {
				videoDivs[i].div.style["transition"] = "all ease-in-out .5s";
			}
			videoDivs[i].div.style.zIndex = i == 1 ? 2 : 0;
			videoDivs[i].div.style.top = top + "%";
		}

		videoDivs[1].div.currentTime = 0;
		unmute( videoDivs[1].div.id );
	}

	function selectClip(){
		clipIsSelected = true;
		var evt = new CustomEvent("clipSelected", {detail:videos[1].name});
		window.events.dispatchEvent(evt);

		window.events.dispatchEvent(new Event("next"));
	}

	this.exit = function(/*evt*/){
		setTimeout(cleanup, 1000);

		for ( var v in videos ){
			mute(videos[v].name);
		}

		// make sure we have a clip selected!
		if ( !clipIsSelected ){
			// selectClip();
			// clipIsSelected = true;
		}

		// remove listeners
		window.removeEventListener("clip_up", prevClip );
		window.removeEventListener("clip_down", nextClip );
		window.removeEventListener("selectClip", selectClip );
	}

	function cleanup() {
		hide("select_clips");
		show("select_intro");

		var btns = document.getElementById("selectButtons");
		btns.classList.remove("enabled");
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
