var countdown = function(data, configHandler){
  var numberDiv = document.getElementById('countdown').
    getElementsByClassName('number')[0];
  var countFrom = 3;
  var currCount;
  this.enter = function(){
    numberDiv.addEventListener('animationiteration', countIter);
    currCount = configHandler.get('countdownTime', countFrom);
    numberDiv.innerHTML = currCount;
    document.getElementById('countdown').classList.add('countdown');
  };
  this.exit = function(){
    numberDiv.removeEventListener('animationiteration', countIter);
    document.getElementById('countdown').classList.remove('countdown');
  };
  function countIter(){
    currCount--;
    numberDiv.innerHTML = currCount;
    if (currCount === 0){
      window.dispatchEvent(new Event('next'));
    }
  }
};
