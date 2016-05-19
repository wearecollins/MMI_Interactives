var clippreview = function(data, configHandler){
  // Localize data
	var videos = data.videos;
  
  /**************************************************
    Section: Set which clip we're performing
  **************************************************/

	var currentClip = null;

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
	window.addEventListener("clipSelected", setClip);

  // timeouts
  var timeouts = [];

  /**************************************************
   * Enter: called automatically when page builds
  **************************************************/

	this.enter = function(/*evt*/){
    var previewTitle = document.getElementById("previewTitle");
    previewTitle.classList.remove("disabled");

    // -----------------------------------------------
    // Setup Videoplayer: once it ends, go to next state

  	var videoDiv = document.getElementById("preview_"+currentClip.name);
    videoDiv.load();
    MMI.show( "preview_"+currentClip.name, "block" );

  	videoDiv.onended = function(){
        window.events.dispatchEvent( new Event("next") );
  	};

    setTimeout(function(){
      previewTitle.classList.add("disabled");
      videoDiv.play();
    }, 2000)
	} 

  /**************************************************
    Exit: called automatically when page closes
  **************************************************/

  this.exit = function(/*evt*/){
    try {
      var videoDiv = document.getElementById("preview_"+currentClip.name);
      videoDiv.pause();
      setTimeout(function(){
        MMI.hide( "preview_"+currentClip.name );
      }, 1000);
    } catch(e){}
  }
};
