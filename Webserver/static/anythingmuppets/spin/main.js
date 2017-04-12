/**
 * Page: spin screen
 * @param  {Object} data
 *                  incoming JSON from data.json
 * @param  {ConfigHandler} configHandler 
 *                         incoming object from global confighandler
 */
var spin = function(data, configHandler){

  /**************************************************
    Section: Main vars
  **************************************************/

  // alpha spin
  var spin = null;

  var nextTimeout, spinStopTimeout;

  /**************************************************
    Section: Enter
  **************************************************/

  this.enter = function(/*evt*/){
    clearTimeout(spinStopTimeout);

    if (spin == null){
      spin = new AlphaVideo();
      //display a spin animation with alpha layer
      // This video file doesn't have a separate alpha layer
      // since we just want to show a white graphic
      // However, we do want to add runtime dropshadow
      spin.setup('spinInput', 'spinOutput', 'spinVideo', 600, 600, true, 6, 15);
    }

    spin.play(undefined, true);

    var timeoutTime = getTimeout(5000);

    //auto-next after 7 seconds
    nextTimeout = setTimeout(function(){
      window.events.dispatchEvent(new Event('next'));
    }, timeoutTime);
  };

  /**
   *  Get this page's timeout based on what is configured
   *  @param {number} default 
   *                  The default timeout to use if nothing is configured
   */
  function getTimeout(time){
    try {
      //read timeout from Page's config file
      // using a fall-back of 1 second
      var timeout = time;
      if (data.timeout){
        if (data.timeout.millis){
          // if a raw time is configured, then use that
          timeout = parseInt(data.timeout.millis);
        } else if (data.timeout.proportional){
          // if a proportional time is configured,
          // it is proportional to the global timeout
          var to = configHandler.get('timeout', 60) * 1000;
          timeout = to * parseFloat(data.timeout.proportional);
        }
      }

      return timeout;
    } catch(e) {
      return time;
    }
  }

  /**************************************************
    Section: EXIT!
  **************************************************/

  this.exit = function(/*evt*/){
    clearTimeout(nextTimeout);
    //stop the spin animation after it has animated off the screen
    spinStopTimeout = setTimeout(spin.stop.bind(spin), 2000);
  };
};
