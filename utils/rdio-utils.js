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
    // - onLoadComplete: callback called when the collection has been loaded
    // - onAlbumsLoaded: callback called when some portion of the collection has been loaded
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
      onLoadComplete: config.onLoadComplete,
      onAlbumsLoaded: config.onAlbumsLoaded,
      onError: config.onError,
      onAdded: config.onAdded,
      onRemoved: config.onRemoved,
      localStorage: config.localStorage && window.localStorage && window.JSON
    };

    this._start = 0;
    this._loading = false;
    this._done = false;
    this._albums = [];
    this._albumsByKey = {};
    this._newAlbums = [];
    this._newAlbumsByKey = {};
    this._firstTime = true;
    
    var whenAuthenticated = function() {
      if (self._config.localStorage) {
        var data = localStorage.__rdioUtilsCollectionAlbums;
        if (data) {
          var albums = JSON.parse(data);
          if (albums instanceof Array && albums.length) {
            var album;
            for (var i = 0; i < albums.length; i++) {
              album = albums[i];
              self._albumsByKey[album.key] = album;
            }

            self._albums = albums;
            self._firstTime = false;

            if (self._config.onAlbumsLoaded) {
              self._config.onAlbumsLoaded(albums);
            }

            if (self._config.onLoadComplete) {
              self._config.onLoadComplete();
            }

            var libraryVersion = localStorage.__rdioUtilsCollectionVersion;
            if (libraryVersion != R.currentUser.get('libraryVersion')) {
              self._startLoad();
            }
          }
        }
      }

      if (self._firstTime) {
        self._startLoad();
      }

      R.currentUser.on('change:libraryVersion', function() {
        self._startLoad();
      });
    };

    R.ready(function() {
      if (R.authenticated()) {
        whenAuthenticated();
      } else {
        var handler = function(authenticated) {
          if (authenticated) {
            R.off('change:authenticated', handler);
            whenAuthenticated();    
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
    _startLoad: function() {
      this._start = 0;
      this._loading = false;
      this._done = false;
      this._newAlbums = [];
      this._newAlbumsByKey = {};

      if (this._firstTime) {
        this._count = 100;
        this._extras = '-*,releaseDate,duration,isClean,canStream,icon,'
          + 'canSample,name,isExplicit,artist,url,albumKey,length,trackKeys,'
          + 'rawArtistKey,artistUrl';
      } else {
        this._count = 1000;
        this._extras = '-*,albumKey';
      }

      this._load();
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
          extras: this._extras,
          sort: this._config.sort
        },
        success: function(data) {
          self._loading = false;
          if (data.result.length) {
            var album;
            for (var i = 0; i < data.result.length; i++) {
              album = data.result[i];
              album.key = album.albumKey;
              delete album.albumKey;
              self._newAlbums.push(album);
              self._newAlbumsByKey[album.key] = album;
            }

            self._start += self._count;
            self._load();
            if (self._firstTime && self._config.onAlbumsLoaded) {
              self._config.onAlbumsLoaded(data.result);
            }
          } else {
            var addedKeys = [];
            var removedKeys = [];

            if (self._firstTime) {
              self._albums = self._newAlbums;
              self._albumsByKey = self._newAlbumsByKey;
            } else {
              var key;

              // Added
              for (key in self._newAlbumsByKey) {
                if (!self._albumsByKey[key]) {
                  addedKeys.push(key);
                }
              }

              // Removed
              for (key in self._albumsByKey) {
                if (!self._newAlbumsByKey[key]) {
                  removedKeys.push(key);
                }
              }

              // Reconcile
              if (addedKeys.length > 100) {
                self._startLoad({ fullLoad: true });
                return;
              } else {
                // Actually add
                if (addedKeys.length) {
                  R.request({
                    method: "get", 
                    content: {
                      keys: addedKeys.join(',')
                      // extras: this.extras
                    },
                    success: function(data) {
                      var addedAlbums = [];
                      var album;
                      for (var key in data.result) {
                        album = data.result[key];
                        addedAlbums.push(album);
                        self._albums.push(album);
                        self._albumsByKey[key] = album;
                      }

                      self._finishLoad(addedAlbums, removedKeys);
                    },
                    error: function(data) {
                      self._loading = false;
                      if (self._config.onError) {
                        self._config.onError(data.message);
                      }
                    }
                  });

                  return;
                }
              }
            }

            self._finishLoad([], removedKeys);
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
    _finishLoad: function(addedAlbums, removedKeys) {
      // Actually remove
      var removedAlbums = [];
      var key;

      for (var i = 0; i < removedKeys.length; i++) {
        key = removedKeys[i];
        removedAlbums.push(this._albumsByKey[key]);
        delete this._albumsByKey[key];
        for (var j = 0; j < this._albums.length; j++) {
          if (this._albums[j].key == key) {
            this._albums.splice(j, 1);
            break;
          }
        }
      }

      // Finish up
      var wasFirstTime = this._firstTime;

      this._newAlbums = [];
      this._newAlbumsByKey = {};
      this.length = this._albums.length;
      this._firstTime = false;
      this._done = true;
      this._save();

      // Send events
      if (wasFirstTime && this._config.onLoadComplete) {
        this._config.onLoadComplete();
      }

      if (addedAlbums.length && this._config.onAdded) {
        this._config.onAdded(addedAlbums);
      }

      if (removedAlbums.length && this._config.onRemoved) {
        this._config.onRemoved(removedAlbums);
      }
    },
    
    // ----------
    _save: function() {
      if (!this._config.localStorage) {
        return;
      }

      var data = JSON.stringify(this._albums);
      localStorage.__rdioUtilsCollectionAlbums = data;
      localStorage.__rdioUtilsCollectionVersion = R.currentUser.get('libraryVersion');
    }
  };

})(window.__rdio);
