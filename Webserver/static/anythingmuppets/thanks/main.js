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

  this.exit = function(/*evt*/){
    clearTimeout(nextTimeout);
  };
};
