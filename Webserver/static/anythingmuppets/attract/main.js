var attract = function(/*data, configHandler*/){
  var videoDiv;

  this.enter = function(/*evt*/){
    var me = document.getElementById('attract');
    videoDiv = me.getElementsByClassName('attractVideo')[0];
    videoDiv.play();
  };

  this.exit = function(/*evt*/){
    videoDiv.pause();
    videoDiv.currentTime = 0;
  };
};
