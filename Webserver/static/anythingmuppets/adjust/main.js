/**
 * Page: adjust screen
 * @param  {Object} data          incoming JSON from data.json
 * @param  {ConfigHandler} configHandler incoming object from global confighandler
 */
var adjust = function(data, configHandler){

  /**************************************************
    Section: Main vars
  **************************************************/


  // hack for multi image problem
  var didSetImage = false;
  var capturedImage = null;
  var currentImageUrl = "";

  // alpha countdown
  var cdOne = null, 
  cdTwo = null, 
  cdThree = null;

  var soundTimeout, nextTimeout;

  var sndFocusVo = new SoundPlayer(), 
  sndCountdown = new SoundPlayer(),
  sndShutter = new SoundPlayer();

  /**************************************************
    Section: Enter
  **************************************************/

  this.enter = function(/*evt*/){
    
    soundTimeout = setTimeout(function(){

      sndFocusVo.play();
      
    }, 500);

    var to = configHandler.get('timeout', 60) * 1000;

    nextTimeout = setTimeout(function(){
      window.events.dispatchEvent(new Event('next'));
    }, to / 2);
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
    //clearTimeout(countdownInterval);
    clearTimeout(nextTimeout);
    
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
