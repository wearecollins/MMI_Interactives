var thanks = function(data, configHandler){

  var nextTimeout;

  this.enter = function(/*evt*/){

    var timeoutTime = getTimeout(5000);

    //auto-next after short delay
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
    var cTime = configHandler.get('thanksTimeout', 0);
    if (cTime){
      //convert from seconds to millis
      return cTime * 1000;
    } else {
      return time;
    }
  }

  this.exit = function(/*evt*/){
    clearTimeout(nextTimeout);
  };
};
