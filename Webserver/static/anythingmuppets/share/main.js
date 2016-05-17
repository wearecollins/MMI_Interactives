/**
 * Page: share screen
 * @param  {Object} data          incoming JSON from data.json
 * @param  {ConfigHandler} configHandler incoming object from global confighandler
 */
var share = function(data, configHandler){

  /**************************************************
    Section: Main vars
  **************************************************/

  var nRetakes = 0;

  // hack for multi image problem
  var didSetImage = false;
  var capturedImage = null;
  var currentImageUrl = "";

  // alpha countdown
  var cdOne = null, 
  cdTwo = null, 
  cdThree = null;

  var name = "AM 000";

  var soundTimeout, nextTimeout;

  var sndFocusVo = new SoundPlayer(), 
  sndCountdown = new SoundPlayer(),
  sndShutter = new SoundPlayer();

  /**************************************************
    Section: Enter
  **************************************************/

  this.enter = function(/*evt*/){
    currentImageUrl = "";
    nRetakes = 0;

    sndFocusVo.setup("focus_vo");
    sndCountdown.setup("snd_countdown");
    sndShutter.setup("snd_shutter");

    // 'take a photo'
    window.addEventListener("capture", startCountdown);

    // 'done'
    window.addEventListener("skipToThanks", skipToThanks);

    // 'capture' to 'share'
    window.addEventListener("share", share);

    // post to fb / tumblr / etc
    window.addEventListener("share_online", shareOnline);

    window.addEventListener("retake", retake);

    // got image from camera app
    window.addEventListener("imageCapture", setImage);

    // should we go back to 'home' screen?
    window.addEventListener("shouldCancel", returnShouldCancel);

    // build countdowns
    if (cdOne == null ){
      cdOne = new AlphaVideo();
      cdOne.setup("countdownInput","countdownOutput", "c_one_v", 600, 600);
      cdTwo = new AlphaVideo();
      cdTwo.setup("countdownInput","countdownOutput", "c_two_v", 600, 600);
      cdThree = new AlphaVideo();
      cdThree.setup("countdownInput","countdownOutput", "c_three_v", 600, 600);
    }
    
    didSetImage = false;

    // are we live streaming, or within Frontend app?
    var doStream = configHandler.get('doStream', false);
    if (doStream == "true" || doStream == true ){
        manager.getStreamHandler().showStream();
    }

    // set next name
    var index = configHandler.get('currentName', 0);
    index++;
    
    // this could be reset daily, or just when it hits
    // a threshold
    if ( index > 1000 ){
      index = 0;
    }
    configHandler.set({'currentName':index});
    name = "AM_"+ index;

    // show buttons after 1 second
    setTimeout(showButtons, 1000, "shareButtonContainer");
    soundTimeout = setTimeout(function(){

      sndFocusVo.play();
      
    }, 500);

    var to = configHandler.get('timeout', 60) * 1000;

    nextTimeout = setTimeout(function(){
      window.events.dispatchEvent(new Event('next'));
    }, to);
  };

  /**************************************************
    Section: Return home
  **************************************************/

  /**
   * On 'shouldCancel' event (from Arduino keyboard),
   * skip back to camera state
   */
  function returnShouldCancel(){
    window.events.dispatchEvent( new Event('cancel') );
  }

  /**************************************************
    Section: Events
  **************************************************/

  function pauseSounds(){
    sndFocusVo.stop();
  }

  var countdownInterval = null;

  function startCountdown(){
    // make sure sound is paused
    pauseSounds();

    // hide buttons
    hideButtons("shareButtonContainer");
    MMI.hide(("captureContainer"));
    MMI.show(("countdownContainer"), "flex");

    // MMI.show(("c_three"), "flex");
    sndCountdown.play();

    cdThree.play(function(){
      sndCountdown.play();
      cdTwo.play(function(){

        sndCountdown.play();
        cdOne.play(function(){
          MMI.hide("countdownContainer");
          MMI.hide("shareButtonContainer")

          // this tells OF to capture
          window.events.dispatchEvent(new CustomEvent('take_photo', {detail: name }));

          var bg = document.getElementById("captureBgContainer");
          bg.style.backgroundColor = "white";

          // play sound
          sndShutter.play();
        });
      });
    });
  }

  function showButtons( whichId ){
    var btnContainer = document.getElementById(whichId);
    btnContainer.classList.remove("disabled");
    btnContainer.classList.add("enabled");
  }

  function hideButtons( whichId ) {
    var btnContainer = document.getElementById(whichId);
    btnContainer.classList.remove("enabled");
    btnContainer.classList.add("disabled");
  }

  function skipToRetake(){
  //todo: WHERE ARE THESE COUNTED 
  // & HOW DO I GET SETTING?
    if ( nRetakes >= 3 ){
      share();
    } else {
      clearTimeout(countdownInterval);
      MMI.hide(("countdownContainer"));
      MMI.show(("retakeContainer"), "flex");
      showButtons("retakeContainer");
    }
  }

  function share(){
    // tell OF we want to keep it!
    window.events.dispatchEvent( new CustomEvent("confirm_photo", {detail: name }));

    clearTimeout(countdownInterval);
    hideButtons("retakeContainer");

    MMI.hide(("countdownContainer"));
    MMI.hide(("retakeContainer"));

    manager.getStreamHandler().hideStream();

    // show 'share online' container
    MMI.show(("shareOnlineContainer"), "flex");
    document.getElementById("shareOnlineContainer").classList.add("enabled");

    setTimeout(function(){
    }, 1000 )
  }

  function shareOnline() {
    var shareServer = configHandler.get('shareServer', "http://localhost:8013");
    var url = shareServer + "/photo";
    var filename = "anythingmuppets/" + currentImageUrl;

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send( "filename=" + filename );

    // then hide the button...
    window.removeEventListener("share_online", shareOnline);
    var btn = document.getElementById("shareOnlineBtn");
    btn.classList.add("disabled");

    var showLocalShare = configHandler.get("showLocalShare", false);
    if ( showLocalShare ){
      // hide 'online'
      document.getElementById("shareOnlineContainer").classList.remove("enabled");
      document.getElementById("shareOnlineContainer").classList.add("disabled");

      // show 'local'
      setTimeout(function(){
        document.getElementById("shareLocalContainer").classList.add("enabled");
        MMI.hide(("shareOnlineContainer"), "flex");
      }, 1000);
    } else {
      // document.getElementById("shareOnlineContainer").classList.remove("enabled");
      // document.getElementById("shareOnlineContainer").classList.add("disabled");
      window.events.dispatchEvent( new Event("next") );
    }
  }

  function setImage(e){
    if ( didSetImage ) return;

    // load image into container
    var bg = document.getElementById("captureBgContainer");
    capturedImage = document.createElement("img");
    capturedImage.onload = function(){
      var s = window.innerHeight / this.height;
      var w = this.width * s;
      bg.style.left = window.innerWidth / 2.0 - w/2.0;
    }

    currentImageUrl = e.detail;

    capturedImage.src = "output/temp/" + currentImageUrl;

    bg.appendChild(capturedImage);

    // set 'name' on share screen
    var un = document.getElementById("uniqueName");
    un.innerHTML = name;

    // call 'retake or not' event
    skipToRetake.bind(this)();
    didSetImage = true;
  }

  function retake(){
    nRetakes++;
    didSetImage = false;

    try {
      var bg = document.getElementById("captureBgContainer");
      bg.removeChild(capturedImage);
      bg.style.backgroundColor = "";
    } catch(e){

    }

    clearTimeout(countdownInterval);
    MMI.hide(("retakeContainer"));
    startCountdown.bind(this)();
  }

  function skipToThanks(){
    clearTimeout(countdownInterval);
    window.events.dispatchEvent(new Event('next'));
  }

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
    clearTimeout(countdownInterval);
    clearTimeout(nextTimeout);
    
    window.removeEventListener("shouldCancel", returnShouldCancel);
    window.removeEventListener("capture", startCountdown);
    window.removeEventListener("skipToThanks", skipToThanks);
    window.removeEventListener("share", share);
    window.removeEventListener("share_online", shareOnline);
    window.removeEventListener("retake", retake);
    window.removeEventListener("imageCapture", setImage);

    var bg = document.getElementById("captureBgContainer");

    setTimeout(cleanUp, 1500);

    clearTimeout(soundTimeout);
    pauseSounds();
  };
};
