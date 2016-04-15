var attract = function(/*manager*/){
	var videoDiv;
	var me;
	this.enter = function(/*evt*/){
		var me = document.getElementById("attract");;
		videoDiv = me.getElementsByClassName("attractVideo")[0];
		videoDiv.play();
	};
	this.exit = function(/*evt*/){
		videoDiv.pause();
		videoDiv.currentTime = 0;
	};
}
