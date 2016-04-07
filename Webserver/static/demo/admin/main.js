var admin = function(data, configHandler){
  window.addEventListener('admin_save', function(/*evt*/){
    var configUpdate = {};
    for(var configI = data.configs.length - 1;
        configI >= 0;
        configI--){
      var configData = data.configs[configI];
      var elem = document.getElementById('config_'+configData.key);
      if (configData.type === 'number'){
        configUpdate[configData.key] = parseFloat(elem.value);
      } else if (configData.type === 'boolean'){
        configUpdate[configData.key] = elem.checked;
      }
    }
    configHandler.set(configUpdate);
  });
  this.enter = function(){
    for(var configI = data.configs.length - 1;
        configI >= 0;
        configI--){
      var configData = data.configs[configI];
      var elem = document.getElementById('config_'+configData.key);
      if (configData.type === 'number'){
        elem.value = configHandler.get(configData.key);
      } else if (configData.type === 'boolean'){
        elem.checked = configHandler.get(configData.key);
      }
    }
  };
  this.exit = function(){
  };
};
