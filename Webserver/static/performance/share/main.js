var share = function( data, configHandler ){

  var currentVideo = null;

  // Override timeout: instead of going back to '0',
  // we go to 'thanks'
  var nextTimeout, nextDelay;
  var emailDisplayStartSize;

  var typeList = ['type_med', 'type_sm', 'type_tiny', 
                  'type_mini', 'type_micro'];
  var currTypeSize = 0;

  document.getElementById('shareNextBtn').onclick = submitEmail;

  /**
   * toggle shift on the software keyboard
   */
  function toggleShift(key){
    var keyboard = document.getElementById('keyboard');
    if (!keyboard.classList.contains('show_symbols')){
      if (key.classList.contains('active')){
        key.classList.remove('active');
      } else {
        key.classList.add('active');
      }
    }
  }

  /**
   * toggle the symbol/number layer on the software keyboard
   */
  function toggleSymbols(){
    var keyboard = document.getElementById('keyboard');
    if (keyboard.classList.contains('show_symbols')){
      keyboard.classList.remove('show_symbols');
    } else {
      keyboard.classList.add('show_symbols');
      var shiftKey = document.getElementById('keyboardShift');
      shiftKey.classList.remove('active');
    }
  }

  /**
   * Delete a character from the displayed e-mail address
   */
  function deleteCharacter(){
    var display = document.getElementById('emailDisplay');
    if (display.innerText.length > 1){
      display.innerText = display.innerText.slice(0, -1);
    }
  }

  /**
   * Get the character specified by the provided software keyboard key
   */
  function getCharacterForKey(key){
    if (key.tagName === 'LI' && key.childElementCount > 0){
      var keyboard = document.getElementById('keyboard');
      if (keyboard.classList.contains('show_symbols')){
        key = key.getElementsByClassName('on')[0];
      } else {
        key = key.getElementsByClassName('off')[0];
      }
    }
    var char = key.innerHTML;
    if (key.classList.contains('pipeKey')){
      char = '|';
    }
    var shiftKey = document.getElementById('keyboardShift');
    if (!shiftKey.classList.contains('active')){
      char = char.toLowerCase();
    } else {
      shiftKey.classList.remove('active');
    }
    return char;
  }

  /**
   * Add a character to the e-mail field
   */
  function addCharacter(char){
    var emailDisplay = document.getElementById('emailDisplay');
    emailDisplay.innerHTML += char;
    if (getSize(emailDisplay) > emailDisplayStartSize){
      setTypeSize(currTypeSize + 1);
    }
  }

  /**
   * handle keys on the software keyboard
   */
  function keyboardPressed(evt){
    var key = evt.target;
    if (key.classList.contains('shift')){
      toggleShift(key);
    } else if (key.classList.contains('enter')){
      if (submitEmail()){
        // if we successfully submit the e-mail,
        // then let's return so we don't reset the 'next' timeout
        return;
      }
    } else if (key.classList.contains('symbols')){
      toggleSymbols();
    } else if (key.classList.contains('delete')){
      deleteCharacter();
    } else {
      var char = getCharacterForKey(key);
      addCharacter(char);
    }
    resetTimeout();
  }

  /**
   * get the "size" of the specified element
   *  This is used for identifying when the text of an element
   *  has out-grown its container
   */
  function getSize(elem){
    return elem.scrollWidth;
  }

  /**
   * restart the timeout for going to the next page
   */
  function resetTimeout(){
    clearTimeout(nextTimeout);
    nextTimeout = setTimeout(function(){
      window.events.dispatchEvent(new Event('next'));
    }, nextDelay);
  }

  document.getElementById('keyboard').onclick = keyboardPressed;

  /**
   * @returns {bool} true if the e-mail request was sent to the server
   */
  function submitEmail(){
    resetTimeout();
    var display = document.getElementById('emailDisplay');
    var email = display.innerText.trim();

    if (checkEmail(email)){
      sendEmail(email);
      //TODO: do this after callback/timeout 
      //from sharing server?
      window.events.dispatchEvent(new Event('next'));
      return true;
    } else {
      console.log('error with e-mail address');
      //TODO: display warning?
      return false;
    }
  }

  /**
   * notify the e-mail server to send the latest recorded video 
   *  to the specified e-mail address
   */
  function sendEmail(email){
    console.log('sending email to', email, currentVideo);
    var url = configHandler.get('emailURL');

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send( 'email=' + email + '&performance=' + currentVideo.video );
  }

  /**
   * Check to ensure that the provided e-mail address is valid
   */
  function checkEmail(email){
    //we'll bypass validating e-mail addresses for now
    return true;
    //only validate the web address portion (after the `@`)
    // the portion before the `@` can basically contain any characters
    var valid = /^.+@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    return valid;
  }

  /**
   * set the video which will be shared via e-mail
   */
  function setVideo(e){
    currentVideo = e.detail;
  }

  window.addEventListener('videoRecorded', setVideo);

  /**
   * reset the e-mail field
   */
  function initEmailDisplay(){
    var emailDisplay = document.getElementById('emailDisplay');
    emailDisplay.innerHTML = '&nbsp;';
    setTypeSize(0);
    emailDisplayStartSize = getSize(emailDisplay);
  }

  /**
   * Set e-mail address type size to the specified index
   */
  function setTypeSize(num){
    if (num === currTypeSize ||
      num >= typeList.length){
      //index is out of range
      // nothing to do here
    } else {
      var emailDisplay = document.getElementById('emailDisplay');
      emailDisplay.classList.remove(typeList[currTypeSize]);
      currTypeSize = num;
      emailDisplay.classList.add(typeList[currTypeSize]);
    }
  }

  this.enter = function(){
    initEmailDisplay();

    //managing the timeout myself since we want to reset it
    // every time a key is pressed
    nextDelay = configHandler.get('timeout', 60) * 1000;
    resetTimeout();
  };

  this.exit = function(/*evt*/){
    clearTimeout(nextTimeout);
  };

};
