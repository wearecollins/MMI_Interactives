var share = function(/*manager*/){

  this.nRetakes = 0;

  // hack for multi image problem
  var didSetImage = false;

  // bind() creates new function refs
  // so we need to create shared variables for adding/removing
  // event listeners!
  var startRef, skipRef, shareRef, retakeRef, setImageRef;

  this.enter = function(/*evt*/){

    this.nRetakes = 0;

    startRef = startCountdown.bind(this);
    skipRef = skipToThanks.bind(this);
    shareRef = share.bind(this);
    retakeRef = retake.bind(this);
    setImageRef = setImage.bind(this);

  	window.addEventListener("capture", startRef);
  	window.addEventListener("skipToThanks", skipRef);
    window.addEventListener("share", shareRef);
    window.addEventListener("retake", retakeRef);
    window.addEventListener("imageCapture", setImageRef);
    
    didSetImage = false;

    var doStream = MMI.getQueryString("stream", false);
    if (doStream == "true" ){
        manager.getStreamHandler().showStream();
    }
  };

  var countdownInterval = null;

  function startCountdown(){
    console.log("START COUNTDOWN");
    // hide buttons
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
          console.log("DISPATCH EVEBT");
          MMI.hide(("c_one"), "flex");
          // this tells OF to capture
          window.dispatchEvent(new Event('take_photo'));

        }.bind(this), 1000);
      }.bind(this), 1000);
    }.bind(this), 1000);
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
    }
  }

  function share(){
    clearTimeout(countdownInterval);
    MMI.hide(("countdownContainer"));
    MMI.hide(("retakeContainer"));
    MMI.show(("shareContainer"), "flex");

    manager.getStreamHandler().hideStream();
  }

  function setImage(e){
    if ( didSetImage ) return;

    var bg = ("captureBgContainer");
    var im = document.createElement("img");
    im.onload = function(){
      var s = window.innerHeight / this.height;
      var w = this.width * s;
      bg.style.left = window.innerWidth / 2.0 - w/2.0;
    }
    im.src = "output/" + e.detail;

    bg.appendChild(im);

    skipToRetake.bind(this)();
    didSetImage = true;
  }

  function retake(){
    this.nRetakes++;

    clearTimeout(countdownInterval);
    MMI.hide(("retakeContainer"));
    startCountdown.bind(this)();
  }

  function skipToThanks(){
    clearTimeout(countdownInterval);
      window.dispatchEvent(new Event('next'));
  }

  this.exit = function(/*evt*/){
    clearTimeout(countdownInterval);
    
    window.removeEventListener("capture", startRef);
    window.removeEventListener("skipToThanks", skipRef);
    window.removeEventListener("share", shareRef);
    window.removeEventListener("retake", retakeRef);
    window.removeEventListener("imageCapture", setImageRef);

    var bg = ("captureBgContainer");
    function cleanUp(){
      bg.innerHTML = "";
      MMI.show(("captureContainer"), "flex");
      MMI.hide(("retakeContainer"));
      MMI.hide(("shareContainer"));
      
      manager.getStreamHandler().hideStream();
    }

    setTimeout(cleanUp, 1000);
  };
};
