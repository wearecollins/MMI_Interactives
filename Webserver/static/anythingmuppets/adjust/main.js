/**
 * Page: adjust screen
 * @param  {Object} data
 *   incoming JSON from data.json
 * @param  {ConfigHandler} configHandler
 *   incoming object from global confighandler
 */
var adjust = function(data, configHandler){

  /**************************************************
    Section: Main vars
  **************************************************/

  var nextTimeout;

  /**************************************************
    Section: Enter
  **************************************************/

  this.enter = function(/*evt*/){

    var timeoutTime = getTimeout(20000);

    //auto-next after proportional timeout
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
    var cTime = configHandler.get('adjustTimeout', 0);
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
  };
};
