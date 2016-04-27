function definedName(){
  this.enter = function(){
    window.events.dispatchEvent(new Event('definedName_enter'));
  };
  this.exit = function(){
    window.events.dispatchEvent(new Event('definedName_exit'));
  };
}
