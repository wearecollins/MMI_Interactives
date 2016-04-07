/**
 * defines a Page
 * @constructor
 */
function Page(){

  // ### Private vars ###
  /** 
   * data for this page, provided by data.json 
   * @type {Object}
   */
  var data;
  /** 
   * the instance of the class containing 
   * custom logic for this particular page 
   */
  var instance;
  /** 
   * the DOM element for this page 
   * @type {Element}
   */
  var domElem;
  /** 
   * the path this page was loaded from 
   * @type {string}
   */
  var path;

  /**
   * loads the page details.
   * @param {string} a_path directory where the page is defined
   *  The directory provided should have:
   *  a data.json file
   *  a template.hbr Handlebar template to generate the Page's markup
   *  a style.css Handlebar template to generate the Page's CSS
   *  a main.js file containing a class for encapsulating custom functionality
   * @param {Element} container 
   *  the DOM container to load this page's markup into
   * @param {ConfigHandler} configHandler
   * @param {Loader} loader the loader to use for loading files 
   *  from the specified directory.
   * @returns {Promise<Page>} A Promise that resolves to this Page once all
   *  elements are loaded
   */
  this.load = function load(a_path, container, configHandler, loader){
    path = a_path;
    var dataPath = path+'/data.json';
    var markupPath = path+'/template.hbr';
    var scriptPath = path+'/main.js';
    var stylePath = path+'/style.css';
    var options =  {data:{path:path}};
  
    //load the remote JSON data
    var jsonPromise = loadJSON(dataPath, loader);

    //remote CSS and HTML files can be Handlebars templates,
    // so they take the eventual JSON result as their
    // Handlebars context
    var cssPromise = loader.loadCSS(stylePath, jsonPromise, options);
    var htmlPromise = loadHTML(markupPath, jsonPromise, 
                               options, container, loader);

    //load the remote Javascript after all other remote files have
    // loaded. This way we guarantee the Javascript has access to all its
    // DOM elements and JSON data.
    return Promise.all([jsonPromise,
                        //we don't care if these promises succeed or fail
                        // we just want to wait until they complete
                        cssPromise.catch( function(){return undefined} ),
                        htmlPromise.catch( function(){return undefined} )]).
                   then( function(){ return loadJS(scriptPath, configHandler, loader)} ).
                   then( ( function(){ return this} ).bind(this) );
  };

  /**
   * initializes the Page using already loaded elements
   * @param {Element} elem the DOM element to use for this page
   * @param {Object} a_data the configuration data used for this Page
   * @param {Object} [inst] the page-specific logic
   */
  this.use = function use(elem, a_data, inst){
    domElem = elem;
    instance = inst;
    data = a_data;
  };

  /**
   * tell this Page to become active on the screen
   */
  this.enter = function enter(){
    if(domElem){
      domElem.classList.remove('disabled');
    }
    if (instance){
      instance.enter();
    }
  };

  /**
   * tell this Page to disappear from the screen
   */
  this.exit = function exit(){
    if(domElem){
      domElem.classList.add('disabled');
    }
    if (instance){
      instance.exit();
    }
  };

  /**
   * @returns {string} the name specified in this page's data.json
   */
  this.getName = function getName(){
    return data.name;
  };

  /**
   * @returns {string} the path this page was loaded from
   */
  this.getPath = function getPath(){
    return path;
  };

  /**
   * @returns {boolean} true if the auto-timeout should be disabled
   */
  this.disabledTimeout = function disabledTimeout(){
    var propName = 'disableTimeout';
    var propValue = true;
    return (data.hasOwnProperty(propName) &&
            (data[propName] === propValue));
  };

  /**
   * @returns {boolean} true if the image stream 
   *  should be shown along with this Page
   */
  this.shouldShowStream = function shouldShowStream(){
    var propName = 'showStream';
    var propValue = true;
    return (data.hasOwnProperty(propName) &&
            (data[propName] === propValue));
  };

  /**
   * loads the page's custom class.
   * @param {string} path filepath to load
   * @param {ConfigHandler} configHandler
   * @param {Loader} loader loader to use
   * @returns {Promise} resolves when the custom class is instantiated
   */
  function loadJS(path, configHandler, loader){
    return loader.loadJS(path).
      then(function(){
        try{
          //the class in this Javascript file should
          // match the name of the state
          instance = new window[data.name](data, configHandler);
        } catch(e){
          log.error('no constructor for',data.name,e);
        }
        log.debug('done loading',path);
      });
  }

  /**
   * loads the specified JSON file
   * @param {string} path path to JSON file
   * @param {Loader} loader loader to use
   * @returns {Promise<Object>} 
   *  resolves to the map defined in the loaded JSON file
   */
  function loadJSON(path, loader){
    return loader.loadJSON(path).
      catch(function(reason){
        log.warn('problem loading JSON',reason);
        //error loading JSON
        // let's provide some defaults
        return {name:path};
      }).
      then(function resolve(json){
        //save the data, and keep passing it down the Promise chain
        data = json;
        return json;
      });
  }

  /**
   * loads the specified Handlebar template and 
   *  imports the generated markup into the DOM
   * @param {string} path filepath to load
   * @param {Promise<Object>|Object} [contextPromise] the context to use
   *  while compiling the Handlebar template
   * @param {Object} [options] the options to use while compiling 
   *  the Handlebar template
   * @param {Element} container 
   *  the DOM element to load the generated markup into
   * @param {Loader} loader loader to use
   * @returns {Promise<Element>} resolves to the resulting DOM element
   */
  function loadHTML(path, contextPromise, options, container, loader){
    return loader.loadHTML(path, contextPromise, options).
      then(function(markup){
        //put the markup into the page
        var div = document.createElement('div');
        div.innerHTML = markup;
        var elem = div.getElementsByClassName('page')[0];
        container.appendChild(elem);
        //start with all states disabled
        elem.classList.add('disabled');
        domElem = elem;
        return elem;
      });
  }
}
