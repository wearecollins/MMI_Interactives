var thanks = function(/*manager*/){

  var voSpinBack = new SoundPlayer();
  var nextTimeout;

  this.enter = function(/*evt*/){

    nextTimeout = setTimeout(function(){
      window.events.dispatchEvent(new Event('next'));
    }, 5000);
  };

  this.exit = function(/*evt*/){
    voSpinBack.stop();
    clearTimeout(nextTimeout);
  };
};
