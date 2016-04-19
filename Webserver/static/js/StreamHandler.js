function StreamHandler(){

  var domElem;
  var prevURL;
  var active = false;
  var domDestination = null;

  this.init = function init(_domDestination){
    domElem = document.createElement('img');
    domDestination = _domDestination;
    domDestination.appendChild(domElem);
  };

  this.showStream = function showStream(){
    active = true;
    MMI.show( domDestination );
  };

  this.hideStream = function hideStream(){
    active = false;
    newURL('');
    MMI.hide( domDestination );
  };

  //images come as binary from the server
  // lets just dump them into an <img>
  this.handleImage = function handleImage(buf){
    if (active){
      var view = new Uint8Array(buf);
      var blob = new Blob([view], {type: 'image/jpeg'});
      var url = window.URL.createObjectURL(blob);
      newURL(url);
    }
  };      

  // this sucks!
  var imageWidth = 1040;
  var imageHeight = 776;
  var lastScale   = 0;
  var autoSize = true;

  function newURL(url){
    domElem.src = url;
    if ( autoSize ){
        try {
          // this sucks!
          var s = window.innerHeight/imageHeight;
          if ( s != lastScale ){ 
            var w = imageWidth * s;
            var h = window.innerHeight;
            domElem.style.width = w +"px";
            domElem.style.height = h +"px";
            domElem.style.left = window.innerWidth/2. - w/2. +"px";
            domElem.style.top = window.innerHeight/2. - h/2. +"px";
          }
          lastScale = s;
        } catch(e){

        }
    }

    if (prevURL){
      window.URL.revokeObjectURL(prevURL);
    }
    prevURL = url;
  }
}
