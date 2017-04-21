var select = function( data/*, configHandler */){

  /**
   * Voiceover: Will automatically play if it
   * exists in template; will do nothing if 
   * commented out in template!
   * @type {SoundPlayer}
   */
  var soundPlayer;
  var soundPlayTimeout;
  var videoClearTimeout;

  var videos = data.videos;
  var videoDivs = [];

  /**************************************************
  * Enter: called automatically when page builds
  **************************************************/

  this.enter = function(){
    // show 'select a clip'
    MMI.show('selectText','flex');

    // setup VO
    if ( soundPlayer === undefined ){
      soundPlayer = new SoundPlayer();
      soundPlayer.setup('vo_select');
    }

    // setup initial states

    if ( videoDivs.length == 0 ){
      for ( var i in videos ){
        var n = videos[i].name;

        videoDivs.push( 
          {
            'name':n,
            'index':i,
            'div':document.getElementById( n ),
            'overlay':document.getElementById( n +'_overlay' ),
            'big_video':document.getElementById( n +'_big_video' ),
            'big':document.getElementById( n +'_big' )
          } );

        videoDivs[videoDivs.length - 1].big_video.onended = videoEnded;
      }
    }

    // play voiceover after animate in
    soundPlayTimeout = setTimeout(function(){
      if ( soundPlayer.exists() ){
        soundPlayer.play( function(){
          // trigger stuff after audio plays, if you'd like
        });
      }
    }, 1000);

    // listen to buttons
    window.addEventListener('selectClip', selectClip );
    window.addEventListener('previewClip', previewClip );
  };

  function videoEnded(e){
    e.target.pause();
    e.target.currentTime = 0;
    videoClearTimeout = setTimeout(function(){
      // hide buttons
      b = document.getElementById('selectButtons');
      b.classList.remove('enabled');
      //show prompt text
      t = document.getElementById('selectClipText');
      t.classList.remove('disabled');
      //hide video
      clearCurrentPreview();
    }, 3000);
  }

  function clearCurrentPreview(){
    if (previewingClip){
      b = document.getElementById(previewingClip);
      b.style.opacity = '0';
      d = document.getElementById(previewingThumb);
      d.classList.add('disabled');
      v = document.getElementById(previewingVideo);
      v.classList.add('disabled');
      mute( previewingVideo );
      previewingClip = previewingThumb = previewingVideo = undefined;
    }
  }


  /**************************************************
      Clip selection (move to next state)
  **************************************************/

  var currentClip = 'black_magic';

  /**
   * Trigger an event to notify everyone which clip was selected,
   *  and go to the next screen
   */
  function selectClip(){
    var evt = new CustomEvent('clipSelected', {detail:currentClip});
    window.events.dispatchEvent(evt);

    window.events.dispatchEvent(new Event('next'));
  }


  /**************************************************
      Clip preview
  **************************************************/

  var previewingClip = null,
      previewingThumb = null,
      previewingVideo = null;

  var buttonTimeout = null;

  /**
   * Preview the selected clip large, and with audio
   */
  function previewClip( e ){
    var b, d, v, t;
    // stop VO if still playing
    if ( soundPlayer.exists() ){
      //cancel starting of clip if it has not started yet
      clearTimeout(soundPlayTimeout);
      soundPlayer.stop();
    }

    clearTimeout(videoClearTimeout);

    clearTimeout(buttonTimeout);
    // hide buttons
    b = document.getElementById('selectButtons');
    b.classList.remove('enabled');
    //hide prompt text
    t = document.getElementById('selectClipText');
    t.classList.add('disabled');

    currentClip  = e.detail;
    var whichDiv = e.detail + '_big';
    var smDiv    = e.detail +'_overlay';
    var whichVid = e.detail + '_big_video';

    //hide the currently showing clip, if any
    clearCurrentPreview();
    //show the newly selected clip
    b = document.getElementById(whichDiv);
    b.style.opacity = '1';
    d = document.getElementById(smDiv);
    d.classList.remove('disabled');
    v = document.getElementById(whichVid);
    unmute( whichVid );

    previewingThumb = smDiv;
    previewingClip = whichDiv;
    previewingVideo = whichVid;

    //show the 'select' button after a short timeout
    buttonTimeout = setTimeout(function(){
      var b = document.getElementById('selectButtons');
      b.classList.add('enabled');
    }, 1000);
  }

  /**************************************************
      Exit: called automatically when page closes
  **************************************************/

  this.exit = function(/*evt*/){
    //clean un-triggered timeouts
    clearTimeout(buttonTimeout);
    clearTimeout(videoClearTimeout);
    //clean up after page animates off
    setTimeout(cleanup, 1000);

    // stop VO if still playing
    if ( soundPlayer.exists() ){
      //cancel starting of clip if it has not started yet
      clearTimeout(soundPlayTimeout);
      soundPlayer.stop();
    }

    // remove listeners
    window.removeEventListener('selectClip', selectClip );
  };

  // cleanup after everything animates off page
  function cleanup() {
    MMI.hide('select_clips');
    MMI.show('select_intro');

    var btns = document.getElementById('selectButtons');
    btns.classList.remove('enabled');
    var t = document.getElementById('selectClipText');
    t.classList.remove('disabled');


    for ( var v in videoDivs ){
      mute(videoDivs[v].name);
      mute(videoDivs[v].name+'_big_video');

      var b = videoDivs[v].big;
      b.style.opacity = '0';

      var d = videoDivs[v].overlay;
      d.classList.add('disabled');
    }
  }

  // utils
  function mute( id ){
    var v = document.getElementById(id);
    if (!v) return;
    v.pause();
    //v.volume = 0;
  }

  function unmute( id ){
    var v = document.getElementById(id);
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    v.volume = 1;
    v.play();
  }
};
