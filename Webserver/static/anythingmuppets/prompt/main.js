/**
 * Page: prompt screen
 * @param  {Object} data          incoming JSON from data.json
 * @param  {ConfigHandler} configHandler incoming object from global confighandler
 */
var prompt = function(data, configHandler){

  /**************************************************
    Section: Main vars
  **************************************************/

  /**************************************************
    Section: Enter
  **************************************************/

  this.enter = function(/*evt*/){
  };
  
  /**************************************************
    Section: EXIT!
  **************************************************/

  function cleanUp(){
    try {
      var bg = document.getElementById("captureBgContainer");
      bg.removeChild(capturedImage);
      bg.style.backgroundColor = "";

      document.getElementById("shareLocalContainer").classList.remove("enabled");
      document.getElementById("shareOnlineContainer").classList.remove("enabled");
      document.getElementById("shareLocalContainer").classList.remove("disabled");
      document.getElementById("shareOnlineContainer").classList.remove("disabled");
  
    } catch(e){

    }

    bg.innerHTML = "";
    MMI.show(("captureContainer"), "flex");
    MMI.hide(("retakeContainer"));
    MMI.show(("shareOnlineContainer"), "flex");
    MMI.show(("shareLocalContainer"), "flex");
    MMI.show("shareButtonContainer", "flex");

    manager.getStreamHandler().hideStream();
    
    var btn = document.getElementById("shareOnlineBtn");
    btn.classList.remove("disabled");
  }

  this.exit = function(/*evt*/){
    // clearTimeout(countdownInterval);
    // clearTimeout(nextTimeout);
    
    // window.removeEventListener("shouldCancel", returnShouldCancel);
    // window.removeEventListener("capture", startCountdown);
    // window.removeEventListener("skipToThanks", skipToThanks);
    // window.removeEventListener("share", share);
    // window.removeEventListener("share_online", shareOnline);
    // window.removeEventListener("share_done", shareDone);
    // window.removeEventListener("retake", retake);
    // window.removeEventListener("imageCapture", setImage);

    // var bg = document.getElementById("captureBgContainer");

    // setTimeout(cleanUp, 1500);

    // clearTimeout(soundTimeout);
    // pauseSounds();
  };
};
