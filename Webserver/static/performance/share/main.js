var share = function(/*manager*/){

	var currentVideo = null;

	function setVideo(e){
		currentVideo = e.detail;

		var source = document.getElementById("shareSource");
	    source.setAttribute("src", "output/" + e.detail);
	}

	window.addEventListener("videoRecorded", setVideo);

	this.enter = function(/*evt*/){
	};
	this.exit = function(/*evt*/){
	};
};
