var share = function(/*manager*/){

	var currentVideo = null;
	var canPlay = false;

	var tryInterval;

	function setVideo(e){
		currentVideo = e.detail;
		canPlay = false;

		var source = document.getElementById("shareSource");
	    source.setAttribute("src", "output/" + e.detail);

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
		var video = document.getElementById("share_video");
		video.play();
		if (!canPlay){
			tryInterval = setInterval(function(){
				if ( canPlay ){
					var video = document.getElementById("share_video");
					video.play();
					clearInterval(tryInterval);
					console.log("YES");
					console.log(video);
				} else {
					console.log("CANT");
				}
			}, 10);
		}
	}

	this.exit = function(/*evt*/){
		clearInterval(tryInterval);

		var video = document.getElementById("share_video");
		video.pause();
		var source = document.getElementById("shareSource");
	    
		source.setAttribute("src","");
	}
};
