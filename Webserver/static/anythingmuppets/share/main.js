var share = function(data, configHandler){

  this.nRetakes = 0;

  // hack for multi image problem
  var didSetImage = false;
  var capturedImage = null;
  var currentImageUrl = "";

  // bind() creates new function refs
  // so we need to create shared variables for adding/removing
  // event listeners!
  var startRef, skipRef, shareRef, shareOnlineRef, retakeRef, setImageRef;

  this.enter = function(/*evt*/){
    currentImageUrl = "";
    this.nRetakes = 0;

    startRef = startCountdown.bind(this);
    skipRef = skipToThanks.bind(this);
    shareRef = share.bind(this);
    shareOnlineRef = shareOnline.bind(this);
    retakeRef = retake.bind(this);
    setImageRef = setImage.bind(this);

  	window.addEventListener("capture", startRef);
  	window.addEventListener("skipToThanks", skipRef);
    window.addEventListener("share", shareRef);
    window.addEventListener("share_online", shareOnlineRef);
    window.addEventListener("retake", retakeRef);
    window.addEventListener("imageCapture", setImageRef);
    
    didSetImage = false;

    var doStream = configHandler.get('doStream', false);

    if (doStream == "true" || doStream == true ){
        manager.getStreamHandler().showStream();
    }

    setTimeout(showButtons, 1000, "shareButtonContainer");
  };

  var countdownInterval = null;

  function startCountdown(){
    // hide buttons
    hideButtons("shareButtonContainer");
    MMI.hide(("captureContainer"));
    MMI.show(("countdownContainer"), "flex");

    MMI.show(("c_three"), "flex");

    countdownInterval = setTimeout(function(){
      MMI.hide(("c_three"), "flex");
      MMI.show(("c_two"), "flex");

      countdownInterval = setTimeout(function(){
        MMI.hide(("c_two"), "flex");
        MMI.show(("c_one"), "flex");

        countdownInterval = setTimeout(function(){
          MMI.hide(("c_one"), "flex");
          MMI.hide("countdownContainer");

          // this tells OF to capture
          window.events.dispatchEvent(new Event('take_photo'));

          var bg = document.getElementById("captureBgContainer");
          bg.style.backgroundColor = "white";

        }.bind(this), 1000);
      }.bind(this), 1000);
    }.bind(this), 1000);
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
    if ( this.nRetakes >= 3 ){
      share();
    } else {
      clearTimeout(countdownInterval);
      MMI.hide(("countdownContainer"));
      MMI.show(("retakeContainer"), "flex");
      showButtons("retakeContainer");
    }
  }

  function share(){
    clearTimeout(countdownInterval);
    hideButtons("retakeContainer");
    MMI.hide(("countdownContainer"));
    MMI.hide(("retakeContainer"));
    MMI.show(("shareContainer"), "flex");

    manager.getStreamHandler().hideStream();
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
    window.removeEventListener("share_online", shareOnlineRef);
    var btn = document.getElementById("shareOnlineBtn");
    btn.classList.add("disabled");
  }

  function setImage(e){
    if ( didSetImage ) return;

    var bg = document.getElementById("captureBgContainer");
    capturedImage = document.createElement("img");
    capturedImage.onload = function(){
      var s = window.innerHeight / this.height;
      var w = this.width * s;
      bg.style.left = window.innerWidth / 2.0 - w/2.0;
    }

    currentImageUrl = e.detail;

    capturedImage.src = "output/anythingmuppets/" + currentImageUrl;

    bg.appendChild(capturedImage);

    skipToRetake.bind(this)();
    didSetImage = true;
  }

  function retake(){
    this.nRetakes++;
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

  this.exit = function(/*evt*/){
    clearTimeout(countdownInterval);
    
    window.removeEventListener("capture", startRef);
    window.removeEventListener("skipToThanks", skipRef);
    window.removeEventListener("share", shareRef);
    window.removeEventListener("share_online", shareOnlineRef);
    window.removeEventListener("retake", retakeRef);
    window.removeEventListener("imageCapture", setImageRef);

    var bg = document.getElementById("captureBgContainer");

    function cleanUp(){
      try {
        var bg = document.getElementById("captureBgContainer");
        bg.removeChild(capturedImage);
        bg.style.backgroundColor = "";
      } catch(e){

      }

      bg.innerHTML = "";
      MMI.show(("captureContainer"), "flex");
      MMI.hide(("retakeContainer"));
      MMI.hide(("shareContainer"));
      
      manager.getStreamHandler().hideStream();
      
      var btn = document.getElementById("shareOnlineBtn");
      btn.classList.remove("disabled");
    }

    setTimeout(cleanUp, 1000);
  };
};
