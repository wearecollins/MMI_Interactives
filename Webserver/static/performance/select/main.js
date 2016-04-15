var select = function(data){

	var videos = data.videos;
	var videoDivs = [];
	var videoContainer;

	this.enter = function(/*evt*/){
		videoContainer = document.getElementById("videoContainer");
		if ( videoDivs.length == 0 ){
			for ( var i in videos ){
				videoDivs.push( document.getElementById( videos[i].name ) );
			}
		}
		// show 'intro'
		show("select_intro");

		setTimeout(function(){
			showSelectCancel.bind(this)();
		}, 1500)

		// listen to buttons
		window.addEventListener("clip_up", prevClip );
		window.addEventListener("clip_down", nextClip );
		window.addEventListener("selectClip", selectClip );
	}

	function showSelectCancel(){
		hide("select_intro");
		show("select_clips");

		unmute( videos[1].name );
	}

	function prevClip(){
		// change order of array
		var v = videoDivs.pop();
		videoDivs.unshift(v);

		var v = videos.pop();
		videos.unshift(v);

		refreshClips();
	}

	function nextClip(){
		var v = videoDivs.shift();
		videoDivs.push(v);

		var v = videos.shift();
		videos.push(v);

		refreshClips();
	}

	function refreshClips(){
		//todo: just move them, man!
		videoContainer.innerHTML = "";
		for ( var i in videoDivs ){
			videoDivs[i].volume = 0;
			videoContainer.appendChild(videoDivs[i]);
			videoDivs[i].play();
		}

		videoDivs[1].currentTime = 0;
		unmute( videoDivs[1].id );
	}

	function selectClip(){
		var evt = new CustomEvent("clipSelected", {detail:videos[1].name});
		window.dispatchEvent(evt);

		window.dispatchEvent(new Event("next"));
	}

	this.exit = function(/*evt*/){
		setTimeout(function(){
			hide("select_clips");
			show("select_intro");
		}, 1000);

		for ( var v in videos ){
			mute(videos[v].name);
		}

		// remove listeners
		window.removeEventListener("clip_up", prevClip );
		window.removeEventListener("clip_down", nextClip );
		window.removeEventListener("selectClip", selectClip );
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
