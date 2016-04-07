/*globals Page, Loader, Transitions*/

/**
 * Manages the current State (aka {@link Page}) of the view. 
 * @constructor
 */
function StateHandler(){
  
  //### Private vars ###
  /** 
   * the list of all pages 
   * @type {Page[]}
   */
  var pages;
  /**
   * custom transitions between pages
   * @type {Transitions}
   */
  var transitions;
  /** 
   * the currently active page index 
   * @type {number}
   */
  var activeStateI = 0;
  /**
   * list of functions to notify on State changes
   * @type {jsonNotifier[]}
   */
  var jsonNotifiers = [];
  /**
   * list of functions to call when the stream should be enabled/disabled
   * @type {streamNotifier[]}
   */
  var streamNotifiers = [];
  /**
   * @type {ConfigHandler}
   */
  var configHandler;

  /**
   * A callback for stream enable/disable notifications
   * @callback streamNotifier
   * @param {boolean} enable whether or not to enable the stream
   */

  //### Public methods ###
  
  /**
   * Loades the provided pages, drops them in the provided container
   * and uses the specified custom transitions.
   * @param {string[]} a_pages a list of paths to load {@link Page}s from
   * @param {Transitions} [a_transitions] 
   *  custom transitions to override defaults.
   * @param {Element} container the DOM container to add {@link Page}s to
   * @param {ConfigHandler} a_configHandler
   */
  this.init = function init(a_pages, 
                            a_transitions, 
                            container, 
                            a_configHandler){
    if (!a_transitions ||
        !(a_transitions instanceof Transitions)){
      log.warn('using default transitions');
      a_transitions = new Transitions();
    }

    transitions = a_transitions;
    configHandler = a_configHandler;

    return loadPages(a_pages, container, a_configHandler).
      then( function(result){(pages = pages.concat(result))} ).
      then( initState.bind(this) );
  };

  /**
   * A callback for json notifications
   * @callback jsonNotifier
   * @param {string} json a JSON-encoded Object or map
   */

  /**
   * adds a function to be called when the state transitions
   * @param {jsonNotifier} func 
   */
  this.addJsonNotifier = function addJsonNotifier(func){
    if (typeof(func) === 'function'){
      jsonNotifiers.push(func);
    }
  };

  /**
   * adds a function to be called when 
   *  the video stream should be shown/hidden
   * @param {streamNotifier} func
   */
  this.addStreamNotifier = function addStreamNotifier(func){
    if (typeof(func) === 'function'){
      streamNotifiers.push(func);
    }
  };

  /**
   * Handles transitioning States.
   * @param {string} action the action driving state transition.
   *  must be one of {@link StateHandler.ACTIONS}.
   * @param {Event} [evt] event that triggered this action.
   */
  this.handleAction = function handleAction(action, evt){
    if (StateHandler.ACTIONS.indexOf(action) >= 0){
      var targetStateI = getTargetStateIndex(activeStateI, action);
      var activeStateName = pages[activeStateI].getName();
      var targetStateName = pages[targetStateI].getName();
      log.info(activeStateName,'->',targetStateName);

      pages[activeStateI].exit(evt);
      notifyTransition(activeStateI, targetStateI);
      manageStream(activeStateI, targetStateI);
      activeStateI = targetStateI;
      pages[targetStateI].enter(evt);
    }
  };

  /**
   * check if the stream should be shown or hidden, 
   *  and notify relevant consumers
   * @param {number} fromIndex the index number of the state we are leaving
   * @param {number} toIndex the index number of the state we are entering
   */
  function manageStream(fromStateI, toStateI){
    var didShow = pages[fromStateI].shouldShowStream();
    var shouldShow = pages[toStateI].shouldShowStream();
    if (didShow !== shouldShow){
      for(var notifierI = streamNotifiers.length - 1;
          notifierI >= 0;
          notifierI--){
        streamNotifiers[notifierI](shouldShow);
      }
    }
  }

  /**
   * check if the auto-timeout should be disabled for the current state
   * @returns {boolean} true if the auto-timeout should be disabled
   */
  this.disabledTimeout = function disabledTimeout(){
    return pages[activeStateI].disabledTimeout();
  };

  /**
   * Notifies all registered jsonNotifiers of the state transition
   * @param {number} fromIndex the index number of the state we are leaving
   * @param {number} toIndex the index number of the state we are entering
   */
  function notifyTransition(fromIndex, toIndex){
    var fromStateName = pages[fromIndex].getName();
    var toStateName = pages[toIndex].getName();
    var message = {state:{from:fromStateName, to:toStateName}};
    for(var notifierI = jsonNotifiers.length - 1;
        notifierI >= 0;
        notifierI--){
      jsonNotifiers[notifierI](message);
    }
  }

  /**
   * Loads all the specified pages.
   * @param {string[]} pageDirs list of directories to load {@link Page}s from.
   * @param {Element} container DOM container to load pages into.
   * @param {ConfigHandler} configHandler
   * @returns {Promise<Page[]>}
   */
  function loadPages(pageDirs, container, configHandler){
    //initialize the loading page, so we have a state to "come from"
    var loadingPage = new Page();
    loadingPage.use(document.getElementById('loading'), {});
    pages = [loadingPage];

    //load all other pages
    var pagePromises = [];
    for(var pageI = 0;
        pageI < pageDirs.length;
        pageI++){
      pagePromises.push(
        loadPage(pageDirs[pageI], container, configHandler).
          //catch any rejection so we wait for all states
          // to finish (whether they fail or succeed, we don't care here)
          catch( function() { return undefined} ));
    }
    return Promise.all(pagePromises);
  }

  /**
   * @param {string} path the state identifier
   * @returns {number} the index of the state with a matching load path.
   *  -1 if no match found
   */
  function statePathToIndex(path){
    for(var stateI = pages.length - 1;
        stateI >= 0;
        stateI--){
      if (pages[stateI].getPath() === path){
        //return the custom state index
        return stateI;
      }
    }
    return -1;
  }

  /**
   * Used for initializing the current State after loading all Pages
   */
  function initState(){
    this.handleAction(StateHandler.ACTIONS.CANCEL);
  }

  /**
   * Loads a particular page
   * @param {string} pagePath path to the Page
   * @param {Element} pageContainer DOM element to load Page DOM elements into
   * @param {ConfigHandler} configHandler
   * @returns {Promise<Page>}
   */
  function loadPage(pagePath, pageContainer, configHandler){
    var page = new Page();
    return page.load(pagePath, pageContainer, configHandler, Loader);
  }

  /*eslint-disable complexity*/
  //cyclomatic complexity is pretty high for case statements
  // making this method a lower cyclomatic complexity will not help
  // readability.
  /**
   * Used for determining the default next State. 
   *  can be overridden via {@link Transitions}
   * @param {number} activeStateIndex the current state index
   * @param {number} numStates the total number of states
   * @param {string} type the action. 
   *  expected to be one of {@link StateHandler.ACTIONS}
   * @returns {number} the index for the state to transition to
   */
  function getDefaultTargetStateIndex(activeStateIndex, numStates, type){
    switch(type){
      case StateHandler.ACTIONS.NEXT:
        if (activeStateIndex >= (numStates - 2)){
          return 1;
        } else {
          return activeStateIndex + 1;
        }
      case StateHandler.ACTIONS.PREV:
        if (activeStateIndex <= 1 ||
            activeStateIndex === numStates - 1){
          return 1;
        } else {
          return activeStateIndex - 1;
        }
      case StateHandler.ACTIONS.ADMIN:
        return numStates - 1;
      case StateHandler.ACTIONS.CANCEL:
      default:
        return 1;
    }
  }
  /*eslint-enable*/

  /**
   * returns the currently active mode for handling transitions
   * @param {ConfigHandler} configHandler
   * @param {Transitions} transitions
   * @returns {Mode}
   */
  function getCurrentMode(configHandler, transitions){
    //get list of configured modes
    var modeNames = transitions.getModeNames();
    //see if there is a mode entry in the config
    var modeName = configHandler.get('mode');
    if (modeName !== undefined){
      if (modeNames.indexOf(modeName) >= 0){
        return transitions.getMode(modeName);
      } else {
        return transitions.getDefaultMode();
      }
    }
    //alternately look for individual mode booleans in the config
    for(var nameI = modeNames.length - 1;
        nameI >= 0;
        nameI--){
      var name = modeNames[nameI];
      var enabled = configHandler.get(name+'Mode', false);
      if (enabled){
        return transitions.getMode(name);
      }
    }
    //if all else fails, use the default mode
    return transitions.getDefaultMode();
  }

  /**
   * Determines which state to transition to
   * @param {number} activeStateIndex the index of the current state
   * @param {string} type the transition {@link StateHandler.ACTIONS|action}
   * @returns {number} the index of the state to transition to
   */
  function getTargetStateIndex(activeStateIndex, type){
    var activeStatePath = pages[activeStateIndex].getPath();
    var currMode = getCurrentMode(configHandler, transitions);
    var nextStatePath = currMode.getDestination(activeStatePath, type);
    //if a custom next state is defined
    if (nextStatePath !== undefined){
      //if the custom next state matches one of the loaded states
      var nextStateI = statePathToIndex(nextStatePath);
      if (nextStateI >= 0){
        return nextStateI;
      }
      log.warn('can not find state',nextStatePath,
                   'defined as target of',type,
                   'event from',activeStatePath);
    }

    log.debug('using default state transition');
    return getDefaultTargetStateIndex(activeStateIndex, pages.length, type);
  }
}

/**
 * The list of actions supported by the StateHandler
 */
StateHandler.ACTIONS = ['next','prev','cancel','admin'];
//populate actions to variables
// so 'next' can be accessed via StateHandler.ACTIONS.NEXT
for(var i = StateHandler.ACTIONS.length -1;
    i >= 0;
    i--){
  var action = StateHandler.ACTIONS[i];
  StateHandler.ACTIONS[action.toUpperCase()] = action;
}
