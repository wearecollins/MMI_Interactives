var thanks = function(/*manager*/){

  var voSpinBack = new SoundPlayer();

  this.enter = function(/*evt*/){

    // should we go back to 'home' screen?
    window.addEventListener("shouldCancel", returnShouldCancel);

    voSpinBack.setup("vo_spin_back");
    voSpinBack.play();

    // round width of arrow
    var v1 = document.getElementById("tyArrow");
    v1.style.width = v1.style.height = Math.round(window.innerWidth * .75) + "px";
  };

  /**
   * On 'shouldCancel' event (from Arduino keyboard),
   * skip back to camera state
   */
  function returnShouldCancel(){
    window.events.dispatchEvent( new Event('cancel') );
    voSpinBack.stop();
  }

  this.exit = function(/*evt*/){
    voSpinBack.stop();
    window.removeEventListener("shouldCancel", returnShouldCancel);
  };
};
