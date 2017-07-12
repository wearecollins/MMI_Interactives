var wait = function(data/*, configHandler */){

  var active = false;
  var ellipsisTimeout = null;
  var ellipsisCount = 0;
  var ellipsisMax = 3;

  function doneProcessing(/*evt*/){
    if (active){
      setTimeout(
        function(){
          window.events.dispatchEvent(new Event('next'));
        },
        0);
    }
  }

  window.addEventListener('videoRecorded', doneProcessing);

  function ellipsis(){
    var title = document.querySelector('#' + data.name + ' .title');
    copy = data.copy;
    for(var i = 0; i < ellipsisMax; i++){
      if (i == ellipsisCount){
        copy += '<span id=\'hiddenEllipsis\'>';
      }
      copy += '.';
    }
    copy += '</span>';
    title.innerHTML = copy

    ellipsisCount = ((ellipsisCount + 1) % (ellipsisMax + 1));
  }

  this.enter = function(){
    active = true;
    ellipsisTimeout = setInterval(ellipsis, 800);
  };

  this.exit = function(/*evt*/){
    active = false;
    clearInterval(ellipsisTimeout);
  };
};
