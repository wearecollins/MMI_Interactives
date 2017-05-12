var attract = function(/*data, configHandler*/){
  var videoDiv;

  this.enter = function(/*evt*/){
    var me = document.getElementById('attract');
    videoDiv = me.getElementsByClassName('attractVideo')[0];
    videoDiv.play();
    //give the feedback camera a break
    // on load, the event system is initialized after this page is loaded
    // so we'll delay sending the event until after the current execution chain
    setTimeout(function(){
      window.events.dispatchEvent(new Event('camera_stop'));
    }, 0);
  };

  this.exit = function(/*evt*/){
    videoDiv.pause();
    videoDiv.currentTime = 0;
  };
};
