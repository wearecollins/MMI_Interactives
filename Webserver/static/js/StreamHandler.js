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
    MMI.show( domDestination.id, "block" );
  };

  this.hideStream = function hideStream(){
    active = false;
    if (prevURL){
      newURL('');
    }
    MMI.hide( domDestination.id );
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

  var aspect      = 9/16;
  var aspect_inv  = 16/9;
  var imageWidth = 776 * aspect;
  var imageHeight = 776;
  var lastScale   = 0;
  var autoSize = true;

  this.setImageDimensions = function (_width, _height) {
    imageWidth = _width;
    imageHeight = _height;
  }

  this.setAutosize  = function (trueFalse) {
    autoSize = trueFalse;
  }

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
