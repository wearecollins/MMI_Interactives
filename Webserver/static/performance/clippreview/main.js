var clippreview = function(data/*, configHandler*/){
  // Localize data
  var videos = data.videos;
  
  /**************************************************
    Section: Set which clip we're performing
  **************************************************/

  var currentClip = null;
  var clipPlayTimeout;
  var voPlaying = false;
  var pageLoaded = false;

  /**
   * Set which clip is the current clip to preview
   */
  function setClip(e){
    for ( var i in videos ){
      var v = videos[i];
      if ( v.name == e.detail ){
        currentClip = videos[i];
        break;
      }
    }
  }

  // this event comes from the 'select' state
  window.addEventListener('clipSelected', setClip);
  window.addEventListener('startSelectVO', startVO);
  window.addEventListener('finishSelectVO', finishVO);

  function startVO(){
    voPlaying = true;
    log.debug("[Performance::ClipPreview::startVO]");
  }

  function finishVO(){
    voPlaying = false;
    log.debug("[Performance::ClipPreview::finishVO]");
    checkContinue();
  }

  function checkContinue(){
    if (!voPlaying && pageLoaded){
      log.debug("[Performance::ClipPreview::checkContinue] continuing");
      previewTitle.classList.add('watermark');
      //and another small delay before starting to play the video
      clipPlayTimeout = setTimeout(function(){
        var videoDiv = document.getElementById('preview_'+currentClip.name);
        videoDiv.volume = 1;
        videoDiv.play();
      }, 500);
    } else {
      log.debug("[Performance::ClipPreview::checkContinue] not ready");
    }
  }

  function firstLoad(){
    setStaticWatermark(document.getElementById('previewTitle'));
  }

  function setStaticWatermark(elem){
    elem.addEventListener('animationend', function(e){
      //replace the watermark animation with a static watermark definition
      // In Safari, the Animation was re-triggering 
      // when the Page was marked disabled
      e.target.classList.remove('watermark');
      e.target.classList.add('staticWatermark');
    });
  }

  firstLoad();

  /**************************************************
   * Enter: called automatically when page builds
  **************************************************/

  this.enter = function(/*evt*/){
    var previewTitle = document.getElementById('previewTitle');
    previewTitle.classList.remove('watermark');
    previewTitle.classList.remove('staticWatermark');

    // -----------------------------------------------
    // Setup Videoplayer: once it ends, go to next state

    var videoDiv = document.getElementById('preview_'+currentClip.name);
    videoDiv.currentTime = 0;
    MMI.show( 'preview_'+currentClip.name, 'block' );

    videoDiv.onended = function(){
      window.events.dispatchEvent( new Event('next') );
    };

    //delay before moving the text out of the way
    clipPlayTimeout = setTimeout(function(){
      pageLoaded = true;
      checkContinue();
    }, 2000);
  };

  /**************************************************
    Exit: called automatically when page closes
  **************************************************/

  this.exit = function(/*evt*/){
    try {
      pageLoaded = false;
      //don't start the clip if it hasn't already!
      clearTimeout(clipPlayTimeout);
      var videoDiv = document.getElementById('preview_'+currentClip.name);
      videoDiv.pause();
      //hide the active video clip after the screen finishes
      // transitioning away
      setTimeout(function(){
        MMI.hide( 'preview_'+currentClip.name );
      }, 1000);
    } catch(e){
      //empty
    }
  };
};
