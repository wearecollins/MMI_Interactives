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
      spin.setup('spinInput', 'spinOutput', 'spinVideo', 600, 600);
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
    var cTime = configHandler.get('spinTimeout', 0);
    if (cTime){
      //convert from seconds to millis
      return cTime * 1000;
    } else {
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
