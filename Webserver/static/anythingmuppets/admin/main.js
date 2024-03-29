var admin = function(data, configHandler){
  var adminButtonEnabled = false;

  //link the save functionality to the saveAdmin button
  window.addEventListener('saveAdmin', function saveAdmin(/*evt*/){
    if ( !adminButtonEnabled ) return;

    //get the UI configs as a map
    var configUpdate = compileConfigs();

    //apply the staged config changes to the global config
    configHandler.set(configUpdate);
    //disable the save button
    disableButton();
  
    // are we streaming now?
    window.events.dispatchEvent(new Event('refreshStreamMode'));
  });

  /**
   * Compile all config settings in the UI to a map
   * @returns {object} map of UI settings as key:value pairs
   */
  function compileConfigs(){
    var elem;
    var configUpdate = {};
    //for each config value in the data.json
    for(var configI = data.configs.length - 1;
        configI >= 0;
        configI--){
      var configData = data.configs[configI];
      //get the UI element for that config entry
      elem = document.getElementById('config_'+configData.key);
      if (configData.type === 'number'){
        //parse the number from the UI value
        var value = parseFloat(elem.value);
        //and apply the optional conversion factor
        if (configData.conversionFactor){
          value *= configData.conversionFactor;
        }
        //and stage the new value for updating our global config
        configUpdate[configData.key] = value;
      } else if (configData.type === 'boolean'){
        //just read the toggle value into staging
        configUpdate[configData.key] = elem.checked;
      } else if (configData.type === 'string'){
        configUpdate[configData.key] = elem.value;
      }
    }

    return configUpdate;
  }

  /**
   * Shutdown the computer
   */
  function shutdown(){
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/comp/shutdown', true);
    xhttp.send();
  }

  //link the shutdown functionality to the shutdown button
  window.addEventListener('shutdown', shutdown);

  /**
   * Update the supplied config entry's UI
   * @param {object} configData
   *   The config data to use for linking global config settings to the UI
   */
  function updateUI(configData){
    //get the UI element
    var elem = document.getElementById('config_'+configData.key);
    //fetch the value to display from the global config
    var displayValue = configHandler.get(configData.key);
    try {
      if (configData.type === 'number'){
        //for number types, we use a range slider
        // with separate number display

        //if this entry has a conversion factor between
        // displayed value and stored value,
        // apply it to the displayed value
        if (configData.conversionFactor){
          displayValue /= configData.conversionFactor;
        }
        //set the UI value
        elem.value = displayValue;
        //and then set the displayed number
        // which also contains a units suffix
        var val = document.getElementById('config_output_'+configData.key);
        val.value = (+(displayValue.toFixed(2))) + configData.suffix;
      } else if (configData.type === 'boolean'){
        //for boolean types, set the toggle switch correctly
        elem.checked = configHandler.get(configData.key);
      } else if (configData.type === 'string'){
        elem.value = configHandler.get(configData.key);
      }
    } catch(e){
      //empty
    }
  }

  this.enter = function adminEnter(){

    //go through all the configs in our data.json
    for(var configI = data.configs.length - 1;
        configI >= 0;
        configI--){
      //update the UI to reflect the associated
      // global config's setting
      updateUI(data.configs[configI]);
    }

    // setup save button
    disableButton();
    window.addEventListener('aElementUpdated', unDisableButton);
  };

  /**
   * disable the Save button after saving
   */
  function disableButton(){
    var btn = document.getElementById('buttonAdminSave');
    btn.classList.add('disabled');
    document.getElementById('buttonAdminCancelCopy').innerText = 'exit';
    adminButtonEnabled = false;
  }

  /**
   * enable the Save button when any configuration changes
   */
  function unDisableButton(){
    var btn = document.getElementById('buttonAdminSave');
    try {
      btn.classList.remove('disabled');
      document.getElementById('buttonAdminCancelCopy').innerText = 'cancel';
    } catch(e){
      //empty
    }
    adminButtonEnabled = true;
  }

  this.exit = function adminExit(){
    window.removeEventListener('aElementUpdated', unDisableButton);
  };
};
