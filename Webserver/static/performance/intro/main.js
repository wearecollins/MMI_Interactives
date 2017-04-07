var intro = function(/*manager*/){

	var soundPlayer = new SoundPlayer();
	var soundTimeout;

	this.enter = function(/*evt*/){

		// if VO is not commented out, play it!
		soundPlayer.setup("vo_grab");
		if ( soundPlayer.exists() ){

			soundTimeout = setTimeout(function(){
				soundPlayer.play();
			}, 1000)
		}
	};

	this.exit = function(/*evt*/){
		clearTimeout(soundTimeout);
		soundPlayer.stop();
	};
}
