var thanks = function(/*manager*/){

	var voThankYou = new SoundPlayer();

	var sTime;

  this.enter = function(/*evt*/){
  	voThankYou.setup("vo_thank_you");
  	sTime = setTimeout(function(){
  		voThankYou.play();
  	}, 1000);
  }

	this.exit = function(/*evt*/){
  		voThankYou.stop();
		clearTimeout(sTime);
	}
};
