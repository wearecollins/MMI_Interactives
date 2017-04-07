var wait = function( data, configHandler ){

	var active = false;

	function doneProcessing(/*evt*/){
		if (active){
			setTimeout(
				function(){
					window.events.dispatchEvent(new Event('next'));
				},
				0);
		}
	}

	window.addEventListener("videoRecorded", doneProcessing);

	this.enter = function(){
		active = true;
	}

	this.exit = function(/*evt*/){
		active = false;
	}
};
