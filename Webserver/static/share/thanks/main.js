var thanks = function(/*manager*/){
	this.enter = function(/*evt*/){
		setTimeout(function(){
			window.events.dispatchEvent(new Event('next'));
		}, 1500);
	};
	this.exit = function(/*evt*/){
	};
}
