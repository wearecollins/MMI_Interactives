var attract = function( data, configHandler ){
  var currentAttractVideo = '';

  var videoDiv;

  this.enter = function(/*evt*/){
    var me = document.getElementById('attract');
    videoDiv = me.getElementsByClassName('attractVideo')[0];
    var sourceElement = document.getElementById('attractVideoSource');

    currentAttractVideo = 
      configHandler.get('attractVideo', 'video/fpo_performance.mp4');
    sourceElement.setAttribute('src', currentAttractVideo);
    videoDiv.load();
    videoDiv.play();
  };

  this.exit = function(/*evt*/){
    videoDiv.pause();
    videoDiv.currentTime = 0;
  };
};
