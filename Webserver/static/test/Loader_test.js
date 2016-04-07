/* globals chai, Loader, testProp*/
var expect = chai.expect;
window.log = console;

describe('Loader', function(){
  it('loading non-existent file returns a promise that rejects', 
    function(){
      var filePromise = Loader.loadType('non-existent.txt', Loader.MIME.txt);
      expect(filePromise).to.be.an.instanceof(Promise);
      return filePromise.
        then(
          function resolve(){
            return Promise.reject();
          },
          function reject(){
            return Promise.resolve();
          });
    }
  );
  it('loading existing file succeeds', function(){
    var filePromise = Loader.loadType('to_load/test.txt', Loader.MIME.txt);
    expect(filePromise).to.be.an.instanceof(Promise);
    return filePromise;
  });
  it('loading JSON returns JSON', function(){
    return Loader.loadJSON('to_load/test.json').
      then( function(json){ return expect(json).to.deep.equal({test:true})} );
  });
  it('loading invalid JSON rejects', function(){
    return Loader.loadJSON('to_load/test.hbr').
      then(
        function resolve(){
          Promise.reject();
        },
        function reject(){
          Promise.resolve();
        });
  });
  it('loading HTML returns markup', function(){
    return Loader.loadHTML('to_load/test.html').
      then(function resolve(markup){
        var div = document.createElement('div');
        div.innerHTML = markup;
        expect(markup).to.equal(div.innerHTML);
      });
  });

  var HTMLcontext = {'test':'content'};
  function checkContent(markup){
    var div = document.createElement('div');
    div.innerHTML = markup;
    expect(div.firstChild.innerHTML).to.equal('content');
  }

  it('loading templated HTML applies context', function(){
    return Loader.loadHTML('to_load/test.hbr', HTMLcontext).
      then( checkContent );
  });
  it('HTML context can also be a Promise', function(){
    return Loader.loadHTML('to_load/test.hbr', 
                           new Promise( function(resolve){return resolve(HTMLcontext) })).
      then( checkContent );
  });
  it.skip('loading HTML also applies options', function(){
  });
  it('loading JS creates script tag in <head>', function(){
    function getNumScript(){
      return document.head.getElementsByTagName('script').length;
    }
    var numScript = getNumScript();
    return Loader.loadJS('to_load/test.js').
      then( function(){ return expect(getNumScript()).to.equal(numScript + 1)} );
  });
  it('loading JS notifies success after script is loaded', function(){
    expect(typeof testProp).to.equal('undefined');
    return Loader.loadJS('to_load/testProp.js').
      then( function(){return expect(testProp).to.exist} );
  });

  function checkLastStyle(color){
    var styles = document.head.getElementsByTagName('style');
    var style = styles[styles.length - 1];
    expect(style.innerText.trim()).
      to.equal('#custom{background-color:'+color+';}');
  }

  it('loading CSS creates style tag', function(){
    function getNumStyle(){
      return document.head.getElementsByTagName('style').length;
    }
    var numStyle = getNumStyle();
    return Loader.loadCSS('to_load/test.css').
      then( function(){ return expect(getNumStyle()).to.equal(numStyle + 1)} );
  });
  it('loading templated CSS applies context', function(){
    var color = 'white';
    return Loader.loadCSS('to_load/style.hbr', {color}).
      then( checkLastStyle.bind(this, color) );
  });
  it('loading CSS accepts Promise for context', function(){
    var color = 'blue';
    return Loader.loadCSS('to_load/style.hbr', 
                          new Promise( function(resolve){resolve({color})} )).
      then( checkLastStyle.bind(this, color) );
  });
  it('loading template CSS also applies options', function(){
    var color = 'green';
    var path = 'sample/path';
    return Loader.loadCSS('to_load/style_with_options.hbr',
                          {color},
                          {data:{path}}).
      then( function(){
        var styles = document.head.getElementsByTagName('style');
        var style = styles[styles.length - 1];
        expect(style.innerText.trim()).
          to.equal('#custom{background-color:'+color+
                   ';background-image:url('+path+'/bg.jpg);}');
      });

  });
});
