var share = function(/*manager*/){

  this.nRetakes = 0;

  this.enter = function(/*evt*/){

  this.nRetakes = 0;

  	window.addEventListener("capture", startCountdown.bind(this));
  	window.addEventListener("skipToThanks", skipToThanks.bind(this));
    window.addEventListener("share", share.bind(this));
    window.addEventListener("retake", retake.bind(this));
    window.addEventListener("imageCapture", setImage.bind(this));
  };

  function show( div, display ){
    div.style.visibility = "visible";
    div.style.display = display;
  }

  function hide( div ){
    div.style.visibility = "hidden";
    div.style.display = "none";
  }

  var countdownInterval = null;

  function startCountdown(){
    // hide buttons
    hide(document.getElementById("captureContainer"));
    show(document.getElementById("countdownContainer"), "flex");

    show(document.getElementById("c_three"), "flex");

    countdownInterval = setTimeout(function(){
      hide(document.getElementById("c_three"), "flex");
      show(document.getElementById("c_two"), "flex");

      countdownInterval = setTimeout(function(){
        hide(document.getElementById("c_two"), "flex");
        show(document.getElementById("c_one"), "flex");
        countdownInterval = setTimeout(function(){
          hide(document.getElementById("c_one"), "flex");
          
          var f = skipToRetake.bind(this)();

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
      hide(document.getElementById("countdownContainer"));
      show(document.getElementById("retakeContainer"), "flex");
    }
  }

  function share(){
    clearTimeout(countdownInterval);
    hide(document.getElementById("countdownContainer"));
    hide(document.getElementById("retakeContainer"));
    show(document.getElementById("shareContainer"), "flex");
  }

  function setImage(e){
    console.log(e);

    var bg = document.getElementById("debugBg");
    var im = document.createElement("img");
    im.src = e.detail;
    bg.appendChild(im);
  }

  function retake(){
    this.nRetakes++;

    clearTimeout(countdownInterval);
    hide(document.getElementById("retakeContainer"));
    startCountdown.bind(this)();
  }

  function skipToThanks(){
    clearTimeout(countdownInterval);
      window.dispatchEvent(new Event('next'));
  }

  this.exit = function(/*evt*/){
  	window.removeEventListener("capture", startCountdown.bind(this));
  	window.removeEventListener("skipToThanks", skipToThanks.bind(this));
    window.removeEventListener("share", share.bind(this));
    window.removeEventListener("retake", retake.bind(this));
    window.removeEventListener("imageCapture", setImage.bind(this));
  };
};
