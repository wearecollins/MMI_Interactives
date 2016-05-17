var thanks = function(/*manager*/){
  this.enter = function(/*evt*/){

    // should we go back to 'home' screen?
    window.addEventListener("shouldCancel", returnShouldCancel);

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
  }

  this.exit = function(/*evt*/){
    window.removeEventListener("shouldCancel", returnShouldCancel);
  };
};
