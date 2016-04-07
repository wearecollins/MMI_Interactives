/**
 * @constructor
 */
var intro = function(/*manager*/){
  /**
   * the DOM element displaying the video
   * @type {Element}
   */
  var videoElem = document.getElementById('intro_video');
  videoElem.addEventListener('ended', videoEnded);

  this.enter = function(){
    videoElem.load();
    videoElem.play();
  };
  this.exit = function(){
    videoElem.pause();
  };

  function videoEnded(){
    window.dispatchEvent(new Event('next'));
  }
};
