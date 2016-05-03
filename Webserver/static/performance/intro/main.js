var intro = function(/*manager*/){

	var lArrow = null;

	this.enter = function(/*evt*/){
		if ( lArrow == null ){
			lArrow = new AlphaVideo();
			lArrow.setup("leftInput","leftOutput", "l_arrow", 600, 600);
		}
		lArrow.play(null, true);
	};
	this.exit = function(/*evt*/){
		lArrow.stop();
	};
}
