var share = function( data, configHandler ){

	var currentVideo = null;
	var canPlay = false;

	var tryInterval;

	var shareOnlineRef;

	function setVideo(e){
		currentVideo = e.detail;
		canPlay = false;

		var source = document.getElementById("shareSource");
	    source.setAttribute("src", "output/performance/" + e.detail);

		var video = document.getElementById("share_video");
		video.load();
		video.addEventListener('loadeddata', function() {
		   	// Video is loaded and can be played
			canPlay = true;
			console.log("CAN");
		}, false);
	}

	window.addEventListener("videoRecorded", setVideo);

	this.enter = function(/*evt*/){
	    shareOnlineRef = shareOnline.bind(this);
    	window.addEventListener("share_online", shareOnlineRef);

		var video = document.getElementById("share_video");
		video.play();
		if (!canPlay){
			tryInterval = setInterval(function(){
				if ( canPlay ){
					var video = document.getElementById("share_video");
					video.play();
					clearInterval(tryInterval);
				} else {
				}
			}, 10);
		}

		document.getElementById("shareAnimateContainer").classList.add("enabled");
	}

	this.exit = function(/*evt*/){
		clearInterval(tryInterval);
    	window.removeEventListener("share_online", shareOnlineRef);
		var video = document.getElementById("share_video");
		video.pause();
		
		setTimeout( cleanup, 1000);
	}

	function cleanup() {
		var source = document.getElementById("shareSource");
		source.setAttribute("src","");

		document.getElementById("shareAnimateContainer").classList.remove("enabled");
	}

	function shareOnline() {
	    var shareServer = configHandler.get('shareServer', "http://localhost:8013");
	    var url = shareServer + "/video";
	    var filename = "performance/" + currentVideo;

	    var xhttp = new XMLHttpRequest();
	    xhttp.open("POST", url, true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send( "filename=" + filename );

	    // then hide the button...
	    window.removeEventListener("share_online", shareOnlineRef);
	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.add("disabled");
	  }
};
