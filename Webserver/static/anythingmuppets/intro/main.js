var intro = function(/*manager*/){
	var videoDiv;
	var me;
  var pauseT;

  this.enter = function(/*evt*/){
    clearTimeout(pauseT);

    var me = document.getElementById("intro");;
  	videoDiv = me.getElementsByClassName("introVideo")[0];
    videoDiv.addEventListener("timeupdate", onTimeupdate);

  	videoDiv.play();

    setTimeout(function(){
      var d = document.getElementById("introButtons");
      d.classList.remove("disabled");
      d.classList.add("enabled");
    }, 1000);
  };

  function onTimeupdate(){
    if ( videoDiv.currentTime >= videoDiv.duration ){
      videoDiv.removeEventListener("timeupdate", onTimeupdate);
      window.events.dispatchEvent( new Event('next') );
    }
  }

  this.exit = function(/*evt*/){
    videoDiv.removeEventListener("timeupdate", onTimeupdate);

    pauseT = setTimeout(function(){
      videoDiv.pause();
      videoDiv.currentTime = 0;
      var d = document.getElementById("introButtons");
      d.classList.remove("enabled");
      d.classList.add("disabled");
    }, 1000);
    
  };
};
