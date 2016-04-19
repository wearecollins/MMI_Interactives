var intro = function(/*manager*/){
	var videoDiv;
	var me;
  var pauseT;

  this.enter = function(/*evt*/){
    clearTimeout(pauseT);

    var me = document.getElementById("intro");;
  	videoDiv = me.getElementsByClassName("intoVideo")[0];
  	videoDiv.play();

    setTimeout(function(){
      var d = document.getElementById("introButtons");
      d.classList.remove("disabled");
      d.classList.add("enabled");
    }, 1000);
  };
  this.exit = function(/*evt*/){
    pauseT = setTimeout(function(){
      videoDiv.pause();
      videoDiv.currentTime = 0;
      var d = document.getElementById("introButtons");
      d.classList.add("disabled");
    }, 1000);
  };
};
