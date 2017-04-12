// todo: {'type':'boolean','key':'introOnOff'},
var admin = function(data, configHandler){
  var adminButtonEnabled = false;

  window.addEventListener('saveAdmin', function(/*evt*/){
    if ( adminButtonEnabled ) return;

    var elem;
    var configUpdate = {};
    for(var configI = data.configs.length - 1;
        configI >= 0;
        configI--){
      var configData = data.configs[configI];
      elem = document.getElementById('config_'+configData.key);
      if (configData.type === 'number'){
        configUpdate[configData.key] = parseFloat(elem.value);
      } else if (configData.type === 'boolean'){
        configUpdate[configData.key] = elem.checked;
      }
    }

    // special values

    elem = document.getElementById('config_timeout');
    try {
      configUpdate['timeout'] = parseFloat(elem.value) * 60;
    } catch(e){
      //empty
    }

    configHandler.set(configUpdate);

    // are we streaming now?
    window.events.dispatchEvent(new Event('refreshStreamMode'));

    disableButton();
    
  });

  function shutdown(){
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/comp/shutdown', true);
    xhttp.send();
  }

  window.addEventListener('shutdown', shutdown);

  this.enter = function(){

    for(var configI = data.configs.length - 1;
        configI >= 0;
        configI--){
      var configData = data.configs[configI];
      var elem = document.getElementById('config_'+configData.key);
      try {
        if (configData.type === 'number' || configData.type === 'string'){
          elem.value = configHandler.get(configData.key);
        } else if (configData.type === 'boolean'){
          elem.checked = configHandler.get(configData.key);
        } 
      } catch(e){
        //empty
      }
    }

    // special cases
    // timeout: more readable in minutes
    var tValue = configHandler.get('timeout');
    tValue = parseFloat(tValue) / 60;
    var div = document.getElementById('config_timeout');
    try {
      div.value = tValue;
      //and set the readout
      var val = document.getElementById('config_output_timeout');
      val.value = (+(tValue.toFixed(2))) + 'm';
    } catch(e){
      //empty
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
    adminButtonEnabled = true;
  }

  /**
   * enable the Save button when any configuration changes
   */
  function unDisableButton(){
    var btn = document.getElementById('buttonAdminSave');
    try {
      btn.classList.remove('disabled');
    } catch(e){
      //empty
    }
    adminButtonEnabled = false;
  }

  this.exit = function(){
    window.removeEventListener('aElementUpdated', unDisableButton);
  };
};
