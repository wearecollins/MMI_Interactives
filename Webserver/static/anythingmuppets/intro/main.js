var intro = function(/*data, configHandler*/){
  var videoDiv;
  var pauseT;

  this.enter = function(/*evt*/){
    clearTimeout(pauseT);

    var me = document.getElementById('intro');
    videoDiv = me.getElementsByClassName('introVideo')[0];
    videoDiv.addEventListener('timeupdate', onTimeupdate);

    videoDiv.muted = false;
    videoDiv.play();
  };

  function onTimeupdate(){
    if ( videoDiv.currentTime >= videoDiv.duration ){
      videoDiv.removeEventListener('timeupdate', onTimeupdate);
      window.events.dispatchEvent( new Event('next') );
    }
  }

  this.exit = function(/*evt*/){
    videoDiv.muted = true;
    videoDiv.removeEventListener('timeupdate', onTimeupdate);

    pauseT = setTimeout(function(){
      videoDiv.pause();
      videoDiv.currentTime = 0;
    }, 2000);
    
  };
};
