var intro = function(/*manager*/){
	var videoDiv;
	var me;
  var pauseT;

  this.enter = function(/*evt*/){
    clearTimeout(pauseT);

    var me = document.getElementById("intro");;
  	videoDiv = me.getElementsByClassName("intoVideo")[0];
  	videoDiv.play();
  };
  this.exit = function(/*evt*/){
    pauseT = setTimeout(function(){
      videoDiv.pause();
      videoDiv.currentTime = 0;
    }, 1000);
  };
};
