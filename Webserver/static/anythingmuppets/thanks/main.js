var thanks = function(/*manager*/){
  this.enter = function(/*evt*/){

    // should we go back to 'home' screen?
    window.addEventListener("shouldCancel", returnShouldCancel);
  };

  /**
   * On 'shouldCancel' event (from Arduino keyboard),
   * skip back to camera state
   */
  function returnShouldCancel(){
    window.events.dispatchEvent( new Event('cancel') );
  }

  this.exit = function(/*evt*/){
    window.removeEventListener("shouldCancel", returnShouldCancel);
  };
};
