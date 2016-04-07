function definedName(){
  this.enter = function(){
    window.dispatchEvent(new Event('definedName_enter'));
  };
  this.exit = function(){
    window.dispatchEvent(new Event('definedName_exit'));
  };
}
