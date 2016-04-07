function StreamHandler(){

  var domElem;
  var prevURL;
  var active = false;

  this.init = function init(domDestination){
    domElem = document.createElement('img');
    domDestination.appendChild(domElem);
  };

  this.showStream = function showStream(){
    active = true;
  };

  this.hideStream = function hideStream(){
    active = false;
    newURL('');
    log.warn('TODO: hide stream!');
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

  function newURL(url){
    domElem.src = url;
    if (prevURL){
      window.URL.revokeObjectURL(prevURL);
    }
    prevURL = url;
  }
}
