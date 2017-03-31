var intro = function(/*manager*/){

	var soundPlayer = new SoundPlayer();

	this.enter = function(/*evt*/){

		// if VO is not commented out, play it!
		soundPlayer.setup("vo_grab");
		if ( soundPlayer.exists() ){
			//soundPlayer.play();

			// doing this instead will kick to the next screen
			// when the VO is done
			setTimeout(function(){
				soundPlayer.play( function(){ window.events.dispatchEvent( new Event("next"))});
			}, 1000)
		}
	};
	this.exit = function(/*evt*/){
		soundPlayer.stop();
	};
}
