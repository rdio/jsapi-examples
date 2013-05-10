// Rdio Utils 0.0.1
// Copyright 2013, Rdio, Inc.
// https://github.com/rdio/jsapi-examples/tree/master/utils
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R) {

  var bind = function(element, eventName, handler) {
    if(element.addEventListener)
      element.addEventListener(eventName, handler, true);
    else
      element.attachEvent("on" + eventName, handler);
  };
  
  // ----------
  var unbind = function(element, eventName, handler) {
    if(element.removeEventListener)
      element.removeEventListener(eventName, handler, true);
    else
      element.detachEvent("on" + eventName, handler);
  };

  // ----------
  window.rdioUtils = {
    // ----------
    addToTopOfQueue: function(sourceKey) {
      var handler = function(model, collection, info) {
        if (model.get('key') == sourceKey) {    
          R.player.queue.off('add', handler);
          R.player.queue.move(info.index, 0);
        }
      };

      R.player.queue.on('add', handler);
      R.player.queue.add(sourceKey);
    },

    // ----------
    // config properties:
    // - sort: what kind of sort to use when loading the collection
    // - extras: extras to use when loading the collection
    // - onLoaded: callback called when the collection has been loaded
    // - onError: callback called if there's an error
    trackCollection: function(config) {
      return new CollectionTracker(config);
    },

    // ----------
    authWidget: function(el) {
      if (el.jquery) {
        el = el[0];
      }

      var showAuthenticated = function() {
        el.innerHTML = R.currentUser.get('firstName') + ' ' + R.currentUser.get('lastName');
      };
      
      R.ready(function() {
        if (R.authenticated()) {
          showAuthenticated();
        } else {
          el.innerHTML = '<button>Sign In With Rdio</button>';
          bind(el, 'click', function() {
            R.authenticate(function(authenticated) {
              if (authenticated) {
                showAuthenticated();
              }
            });
          });
        }
      });
    }
  };

  // ----------
  var CollectionTracker = function(config) {
    var self = this;
    this._config = {
      sort: config.sort || 'playCount',
      extras: config.extras,
      onLoaded: config.onLoaded,
      onError: config.onError 
    };

    if (!this._config.extras) {
      this._config.extras = '-*,releaseDate,duration,isClean,canStream,icon,'
        + 'canSample,name,isExplicit,artist,url,albumKey,length,trackKeys,'
        + 'rawArtistKey,artistUrl';
    }

    this._start = 0;
    this._count = 100;
    this._loading = false;
    this._done = false;
    this._albums = [];
    
    // var stored = (Main.resetFlag ? null : amplify.store('albums'));
    // if (stored && stored.models) {
    //   _.each(stored.models, function(v, i) {
    //     self.addAlbum(v);
    //   });
    // }

    R.ready(function() {
      if (R.authenticated()) {
        self._load();
      } else {
        var handler = function(authenticated) {
          if (authenticated) {
            R.off('change:authenticated', handler);
            self._load();    
          }
        };

        R.on('change:authenticated', handler);
      }
    });
  };

  // ----------
  CollectionTracker.prototype = {
    // ----------
    at: function(index) {
      return this._albums[index];
    },

    // ----------
    _load: function() {
      var self = this;
      if (this._loading || this._done) {
        return;
      }
      
      this._loading = true;
        
      R.request({
        method: "getAlbumsInCollection", 
        content: {
          user: R.currentUser.get("key"), 
          start: this._start,
          count: this._count,
          extras: this._config.extras,
          sort: this._config.sort
        },
        success: function(data) {
          self._loading = false;
          if (data.result.length) {
            for (var i = 0; i < data.result.length; i++) {
              self._albums.push(data.result[i]);
            }

            self.length = self._albums.length;

            self.save();
            self._start += self._count;
          //   self._load();
          // } else {
            self._done = true;
            if (self._config.onLoaded) {
              self._config.onLoaded();
            }
          }
        },
        error: function(data) {
          self._loading = false;
          if (self._config.onError) {
            self._config.onError(data.message);
          }
        }
      });      
    },
    
    // ----------
    save: function() {
      // var data = {
      //   models: _.map(this.models, function(v, i) {
      //     return v.toJSON();
      //   })
      // };
      
      // amplify.store('albums', data);
    }
  };

})(window.__rdio);
