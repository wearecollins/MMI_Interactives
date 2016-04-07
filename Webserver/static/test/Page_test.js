/* globals chai, Page, Loader*/
var expect = chai.expect;
window.log = console;

describe('Page', function(){

  var container;
  function clearContainer(){
    container.innerHTML = '';
    expect(container.childElementCount).to.equal(0);
  }

  before(function(){
    container = document.getElementById('pageContainer');
  });

  it('can load from a path', function(){
    var page = new Page();
    var loadPromise = page.load('pages/full', container, Loader);
    expect(loadPromise).to.be.an.instanceof(Promise);
    return loadPromise;
  });
  it('returned promise resolves to itself', function(){
    var page = new Page();
    var loadPromise = page.load('pages/full', container, Loader);
    return loadPromise.then( function(p){ return expect(p).to.equal(page)} );
  });
  it('load resolves once markup is loaded into container', function(){
    clearContainer();
    var page = new Page();
    var loadPromise = page.load('pages/full', container, Loader);
    return loadPromise.
      then( function(){ return expect(container.childElementCount).to.equal(1)} );
  });
  it('page info is loaded from data.json', function(){
    return new Page().
      load('pages/full', container, Loader).
      then( function resolve(page){
        expect(page.getPath()).to.equal('pages/full');
        expect(page.getName()).to.equal('definedName');
      });
  });
  it('empty directory rejects', function(){
    return new Page().
      load('pages/empty', container, Loader).
      then( function(){Promise.reject()},
            function(){Promise.resolve()} );
  });
  it('missing css is fine', function(){
    return new Page().
      load('pages/no_css', container, Loader);
  });
  it('created DOM element starts out disabled', function(){
    clearContainer();
    return new Page().
      load('pages/full', container, Loader).
      then( function resolve(){
        expect(container.childNodes[0].classList.contains('disabled')).
          to.be.true;
      });
  });
  it('enter and exit modify DOM element\'s Classes', function(){
    clearContainer();
    return new Page().
      load('pages/full', container, Loader).
      then( function resolve(page){
        expect(container.childNodes[0].classList.contains('disabled')).
          to.be.true;
        page.enter();
        expect(container.childNodes[0].classList.contains('disabled')).
          to.be.false;
        page.exit();
        expect(container.childNodes[0].classList.contains('disabled')).
          to.be.true;
      });
  });
  it('enter and exit call methods in custom class', function(){
    var promise = new Promise( function(resolve, reject){
      var entered = false;
      var exited = false;
      function check(){if(entered && exited){resolve();}}
      window.addEventListener('definedName_enter', function(){
        if (entered){
          reject('entered twice');
        } else {
          entered = true;
        }
        check();
      });
      window.addEventListener('definedName_exit', function(){
        if (exited){
          reject('exited twice');
        } else {
          exited = true;
        }
        check();
      });
    });
    new Page().
      load('pages/full', container, Loader).
      then( function resolve(page){
        page.enter();
        page.exit();
      });
    return promise;
  });
});
