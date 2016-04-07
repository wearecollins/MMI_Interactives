
/**
 * @constructor
 */
function Transitions(){
  /**
   * @type {Map<string, Mode>}
   */
  var modes = {};
  /**
   * @type Mode
   */
  var defaultMode = new Mode();

  /**
   * @param {string} name identifying name for the mode
   * @returns {Mode}
   */
  this.createMode = function createMode(name){
    var mode = new Mode();
    modes[name] = mode;
    return mode;
  };

  /**
   * @returns {Mode}
   */
  this.getDefaultMode = function getDefaultMode(){
    return defaultMode;
  };

  /**
   * @param {string} name identifying name for the mode
   * @returns {Mode}
   */
  this.getMode = function getMode(name){
    return modes[name];
  };

  /**
   * @returns {string[]} identifying names for all registered Modes.
   *  in addition to this list there is also the default Mode available
   *  via {@link Transitions.getDefaultMode}
   */
  this.getModeNames = function getModeNames(){
    return Object.keys(modes);
  };
}

/**
 * @constructor
 */
function Mode(){

  var globals = {};
  var transitions = {};
  
  /**
   * @param {string} from name for the starting state
   * @param {string} action transition action to match. 
   *  Should be one of {@link StateHandler.ACTIONS}
   * @param {string} to name for the destination state
   */
  this.addTransition = function addTransition(from, action, to){
    if (!transitions.hasOwnProperty(from)){
      transitions[from] = {};
    }
    var fromT = transitions[from];
    fromT[action] = to;
  };

  /**
   * @param {string} action transition action to match. 
   *  Should be one of {@link StateHandler.ACTIONS}
   * @param {string} to name for the destination state
   */
  this.addGlobalTransition = function addGlobalTransition(action, to){
    globals[action] = to;
  };

  /**
   * @param {string} from name for the starting state
   * @param {string} action transition action to match. 
   *  Should be one of {@link StateHandler.ACTIONS}
   * @returns {string|undefined} the name of the destination state.
   *  undefined if no matching transition is defined.
   */
  this.getDestination = function getDestination(from, action){
    if (transitions.hasOwnProperty(from) && 
        transitions[from].hasOwnProperty(action)){
      return transitions[from][action];
    } else if (globals.hasOwnProperty(action)){
      return globals[action];
    } else {
      return undefined;
    }
  };
}
