/**
 * Page: Script
 * Much is built in the template, from the 'data.json' file.

 * @param  {Object} data 
 *   JSON from data.json, including all script info
 * @param  {ConfigHandler} configHandler 
 *   incoming object from global confighandler
 */
var script = function(/*data, configHandler*/){

  /**************************************************
      Section: Enter
  **************************************************/
  
  this.enter = function(/*evt*/){
    //reset the camera to work around any long-run issues
    //window.events.dispatchEvent(new Event('camera_reset'));
    window.events.dispatchEvent(new Event('camera_start'));
  };
  
  /**************************************************
      Section: Exit
  **************************************************/
  
  this.exit = function(/*evt*/){
  };
};
