//! rdioUtils 0.0.5
//! Built on 2013-08-13
//! https://github.com/rdio/jsapi-examples/tree/master/utils
//! Copyright 2013, Rdio, Inc.
//! Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// NOTE: This is a built file; to edit the code, see the development folder.

// ----------------------------------------------------------------------------------
// rdioUtils -- main.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R) {

  var verbose = false;

  // ----------
  function dialog(message) {
    var body = document.getElementsByTagName('body')[0];
    var el = document.createElement('div');
    el.className = "rdio-utils-dialog";
    el.innerHTML = '<div>'
      + message
      + '</div><br><button>OK</button>';

    var button = el.getElementsByTagName('button')[0];
    rdioUtils._bind(button, 'click', function() {
      body.removeChild(el);
    });

    body.appendChild(el);
  }

  // ----------
  window.rdioUtils = {
    // ----------
    startupChecks: function() {
      var self = this;
      
      if (!R) {
        dialog('Unable to contact Rdio API. Please try again later.');
        return false;
      }

      R.on('flashError', function() {
        dialog('The Rdio API requires Flash in this browser. Please install (or unblock) the Flash plug-in.');
      });

      R.on('cookieError', function() {
        dialog('The Rdio API won\'t work while cookies are blocked. Please unblock cookies for rdio.com.');
      });

      return true;
    },

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
    collectionAlbums: function(config) {
      return new this.CollectionTracker(config);
    },

    // ----------
    authWidget: function(el) {
      var self = this;
      
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
          self._bind(el, 'click', function() {
            R.authenticate(function(authenticated) {
              if (authenticated) {
                showAuthenticated();
              }
            });
          });
        }
      });
    },

    // ----------
    albumWidget: function(album) {
      return new this.AlbumWidget(album);
    },

    // ----------
    localQueue: function(config) {
      return new this.LocalQueue(config);
    },

    // ----------
    _bind: function(element, eventName, handler) {
      if(element.addEventListener) {
        element.addEventListener(eventName, handler, true);
      } else {
        element.attachEvent('on' + eventName, handler);
      }
    },
    
    // ----------
    _unbind: function(element, eventName, handler) {
      if(element.removeEventListener) {
        element.removeEventListener(eventName, handler, true);
      } else {
        element.detachEvent('on' + eventName, handler);
      }
    },

    // ----------
    _stopEvent: function(event) {    
      if(event.preventDefault) {
        event.preventDefault();    
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
        event.returnValue = false;
      }
    },

    // ----------
    _escape: function(text) {
      text = text + ''; // Make sure it's a string
      return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },

    // ----------
    _log: function() {
      /*globals console */
      if (verbose && window.console && console.log) {
        console.log.apply(console, arguments);
      }
    },

    // ----------
    _assert: function(condition, message) {
      /*globals console */
      if (!window.console) {
        return;
      }

      if (console.assert) {
        console.assert(condition, message);
      } else if (condition && console.error) {
        console.error('[rdioUtils] assert failed: ' + message);
      }
    }
  };

})(window.__rdio);

// ----------------------------------------------------------------------------------
// rdioUtils -- album-widget.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.AlbumWidget = function(album) {
    this._element = document.createElement('div');
    this._element.className = 'rdio-utils-album';

    this._broken = !(album && album.url && album.icon && album.name 
      && album.artist && album.artistUrl && album.length && album.key
      && /^(a|al)[0-9]/.test(album.key));

    if (this._broken) {
      this._element.innerHTML = ''
        + '<div class="rdio-utils-album-cover">'
          + '<div class="rdio-utils-album-icon"></div>'
        + '</div>'
        + '<div class="rdio-utils-album-title rdio-utils-truncated">Unknown Album</div>'
        + '<div class="rdio-utils-album-author rdio-utils-truncated">&nbsp;</div>'
        + '<div class="rdio-utils-album-size rdio-utils-truncated">&nbsp;</div>';

      return;
    }

    this._element.innerHTML = ''
        + '<div class="rdio-utils-album-cover">'
          + '<a href="http://www.rdio.com' + rdioUtils._escape(album.url) + '" target="_blank">'
            + '<div class="rdio-utils-album-icon" style="background-image: url(' + rdioUtils._escape(album.icon) + ')"></div>'
            + '<div class="rdio-utils-album-hover-overlay">'
              + '<div class="rdio-utils-album-play-btn"></div>'
              // + '<div class="rdio-utils-album-action-btn"></div>'
            + '</div>'
          + '</a>'
        + '</div>'
        + '<div class="rdio-utils-album-title rdio-utils-truncated"><a href="http://www.rdio.com' + rdioUtils._escape(album.url) + '" target="_blank">' + rdioUtils._escape(album.name) + '</a></div>'
        + '<div class="rdio-utils-album-author rdio-utils-truncated"><a href="http://www.rdio.com' + rdioUtils._escape(album.artistUrl) + '" target="_blank">' + rdioUtils._escape(album.artist) + '</a></div>'
        + '<div class="rdio-utils-album-size rdio-utils-truncated">' + rdioUtils._escape(album.length) + ' songs</div>';

    var button = this._element.getElementsByClassName('rdio-utils-album-play-btn')[0];
    rdioUtils._bind(button, 'click', function(event) {
      rdioUtils._stopEvent(event);

      if (event.altKey || event.metaKey) {
        R.player.queue.addPlayingSource();
      }

      R.player.play({ source: album.key });
    });

    // button = this._element.getElementsByClassName('rdio-utils-album-action-btn')[0];
    // rdioUtils._bind(button, 'click', function(event) {
    //   self._openActionMenu();
    // });
  };

  // ----------
  rdioUtils.AlbumWidget.prototype = {
    // ----------
    element: function() {
      return this._element;
    },

    // ----------
    broken: function() {
      return this._broken;
    },

    // ----------
    _openActionMenu: function() {
    }
  };

})(window.__rdio, window.rdioUtils);

// ----------------------------------------------------------------------------------
// rdioUtils -- collection-tracker.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.CollectionTracker = function(config) {
    var self = this;
    this._config = {
      onLoadComplete: config.onLoadComplete,
      onAlbumsLoaded: config.onAlbumsLoaded,
      onError: config.onError,
      onAdded: config.onAdded,
      onRemoved: config.onRemoved
    };

    if (config.localStorage && window.JSON) {
      // Determine if localStorage is available.
      // See: https://gist.github.com/paulirish/5558557
      try {
        var testKey = '__rdioUtilsTestKey';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        this._config.localStorage = true;
      } catch(e) {
      }      
    }

    this.length = 0;
    this._start = 0;
    this._loading = null;
    this._albums = [];
    this._albumsByKey = {};
    this._newAlbums = [];
    this._newAlbumsByKey = {};
    this._firstTime = true;
    
    this._bigExtras = '-*,releaseDate,duration,isClean,canStream,icon,'
      + 'canSample,name,isExplicit,artist,url,length,trackKeys,artistUrl';

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
            self.length = self._albums.length;
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

      R.currentUser.on('change:libraryVersion', function(value) {
        rdioUtils._log('change:libraryVersion: ' + value);
        if (self._loading) {
          self._loading.loadAgain = true;

          if (!self._firstTime) {
            rdioUtils._assert(self._loading.request, '_loading.request must exist');
            self._loading.request.abort();
          }
        } else {
          self._startLoad();
        }
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
  rdioUtils.CollectionTracker.prototype = {
    // ----------
    at: function(index) {
      return this._albums[index];
    },

    // ----------
    each: function(iterator) {
      for (var i = 0; i < this._albums.length; i++) {
        iterator(this._albums[i], i);
      }
    },

    // ----------
    _startLoad: function() {
      rdioUtils._log('_startLoad');
      this._start = 0;
      this._newAlbums = [];
      this._newAlbumsByKey = {};
      this._loading = {};

      if (this._firstTime) {
        this._count = 100;
        this._extras = this._bigExtras + ',albumKey,rawArtistKey';
      } else {
        this._count = 1000;
        this._extras = '-*,albumKey';
      }

      this._load();
    },

    // ----------
    _load: function() {
      rdioUtils._log('_load');      
      var self = this;
      rdioUtils._assert(this._loading, '_loading must exist');
      rdioUtils._assert(!this._loading.request, '_loading.request must not exist');
        
      this._loading.request = R.request({
        method: "getAlbumsInCollection", 
        content: {
          user: R.currentUser.get("key"), 
          start: this._start,
          count: this._count,
          extras: this._extras,
          sort: 'playCount'
        },
        success: function(data) {
          self._loading.request = null;

          if (data.result.length) {
            var album;
            for (var i = 0; i < data.result.length; i++) {
              album = data.result[i];

              album.key = album.albumKey;
              delete album.albumKey;

              album.artistKey = album.rawArtistKey;
              delete album.rawArtistKey;

              self._newAlbums.push(album);
              self._newAlbumsByKey[album.key] = album;
            }

            if (self._firstTime && self._config.onAlbumsLoaded) {
              self._config.onAlbumsLoaded(data.result);
            }
          }
          
          if (data.result.length == self._count) {
            self._start += self._count;
            self._load();
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

              // Grab full data for added albums
              if (addedKeys.length) {
                self._getAlbums(addedKeys, function(addedAlbums) {
                  self._finishLoad(addedAlbums, removedKeys);
                });

                return;
              }
            }

            self._finishLoad([], removedKeys);
          }
        },
        error: function(data) {
          rdioUtils._log('_load error: ' + data.status);
          self._loading.request = null;
          if (data.status != 'abort' && self._config.onError) {
            self._config.onError(data.message);
          }

          self._loadingDone();
        }
      });      
    },

    // ----------
    _getAlbums: function(keys, callback) {
      rdioUtils._log('_getAlbums');
      var self = this;
      rdioUtils._assert(this._loading, '_loading must exist');
      rdioUtils._assert(!this._loading.request, '_loading.request must not exist');

      var chunkSize = 200;
      var keysChunk = keys.slice(0, chunkSize);
      var keysRemainder = keys.slice(chunkSize);

      this._loading.request = R.request({
        method: "get", 
        content: {
          keys: keysChunk.join(','),
          extras: this._bigExtras + ',key,artistKey'
        },
        success: function(data) {
          self._loading.request = null;
          var addedAlbums = [];
          var album;
          for (var key in data.result) {
            album = data.result[key];
            addedAlbums.push(album);
          }

          if (keysRemainder.length) {
            self._getAlbums(keysRemainder, function(moreAddedAlbums) {
              callback(addedAlbums.concat(moreAddedAlbums));
            });
          } else {
            callback(addedAlbums);
          }
        },
        error: function(data) {
          rdioUtils._log('_getAlbums error: ' + data.status);
          self._loading.request = null;
          if (data.status != 'abort' && self._config.onError) {
            self._config.onError(data.message);
          }

          self._loadingDone();
        }
      });
    },

    // ----------
    _finishLoad: function(addedAlbums, removedKeys) {
      var i;

      // Actually remove
      var removedAlbums = [];
      var key;
      for (i = 0; i < removedKeys.length; i++) {
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

      // Actually add
      var album;
      for (i = 0; i < addedAlbums.length; i++) {
        album = addedAlbums[i];
        this._albums.push(album);
        this._albumsByKey[album.key] = album;
      }

      // Finish up
      var wasFirstTime = this._firstTime;

      this._newAlbums = [];
      this._newAlbumsByKey = {};
      this.length = this._albums.length;
      this._firstTime = false;
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

      // Final cleanup
      this._loadingDone();
    },

    // ----------
    _loadingDone: function() {
      rdioUtils._assert(this._loading, '_loading must exist');
      rdioUtils._assert(!this._loading.request, '_loading.request must not exist');

      var loadAgain = this._loading.loadAgain;
      
      this._loading = null;
      
      if (loadAgain) {
        this._startLoad();
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

})(window.__rdio, window.rdioUtils);

// ----------------------------------------------------------------------------------
// rdioUtils -- local-queue.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.LocalQueue = function(config) {
    var self = this;

    this.length = 0;
    this._onStart = config.onStart;
    this._onStop = config.onStop;
    this._onPlay = config.onPlay;
    this._onAdd = config.onAdd;
    this._onRemove = config.onRemove;
    this._sources = [];
    this._playing = false;
    this._playingSource = null;
    this._keyFromQueue = '';

    R.ready(function() {
      R.player.queue.on('remove', function(source, collection, info) {
        if (info.index === 0) {
          self._keyFromQueue = source.get('key');
        }
      });

      R.player.on('change:playingSource', function(playingSource) {
        if (self._playing) {
          if (!self._playingSourceIsPlaying()) {
            if (playingSource.get('key') == self._keyFromQueue && self._sources.length) {
              self._play(self.remove());
            } else {
              self._playing = false;
              self._playingSource = null;
              if (self._onStop) {
                self._onStop();
              }
            }
          }
        }
      });

      R.player.on('change:isMaster', function(isMaster) {
        if (self._playing && !isMaster) {
          self._playing = false;
          if (self._onStop) {
            self._onStop();
          }
        }
      });
    });
  };

  // ----------
  rdioUtils.LocalQueue.prototype = {
    // ----------
    stop: function() {
      if (!this._playing) {
        return;
      }

      if (this._playingSourceIsPlaying()) {
        R.player.nextSource();
      }

      this._playing = false;
      this._playingSource = null;
      if (this._onStop) {
        this._onStop();
      }
    },

    // ----------
    add: function(key, index) {
      var source = {
        key: key
      };

      if (typeof index === 'undefined' || index < 0 || index >= this._sources.length) {
        index = this._sources.length;
        this._sources.push(source);
      } else {
        this._sources.splice(index, 0, source);
      }

      this.length = this._sources.length;

      if (this._onAdd) {
        this._onAdd(source, index);
      }
    },

    // ----------
    remove: function(indexOrSource) {
      var index = -1;

      if (typeof indexOrSource === 'undefined') {
        if (this._sources.length) {
          index = 0;
        }
      } else if (typeof indexOrSource === 'number') {
        if (indexOrSource >= 0 && indexOrSource < this._sources.length) {
          index = indexOrSource;
        }
      } else {
        // Assume it's a source
        for (var i = 0; i < this._sources.length; i++) {
          if (this._sources[i] === indexOrSource) {
            index = i;
            break;
          }
        }
      }

      if (index === -1) {
        return null;
      }

      var source = this._sources.splice(index, 1)[0];
      this.length = this._sources.length;

      if (this._onRemove) {
        this._onRemove(source, index);
      }

      return source;
    },

    // ----------
    play: function(indexOrSource) {
      var self = this;

      var source;
      if (typeof indexOrSource === 'undefined') {
        if (this._playing) {
          return;
        }

        source = this._playingSource || this.remove();
        if (!source) {
          return;
        }

        this._play(source);
      } else {
        source = this.remove(indexOrSource);
        if (!source) {
          return;
        }

        this._forceReady(function() {
          if (self._playingSourceIsPlaying()) {
            self._play(source, { replace: true });
          } else {
            self._play(source);
          }
        });
      }
    },

    // ----------
    next: function() {
      this.play(0);
    },

    // ----------
    playing: function() {
      return this._playing;
    },

    // ----------
    at: function(index) {
      return this._sources[index];
    },

    // ----------
    each: function(iterator) {
      for (var i = 0; i < this._sources.length; i++) {
        iterator(this._sources[i], i);
      }
    },

    // ----------
    clear: function() {
      while(this._sources.length) {
        this.remove();
      }
    },

    // ----------
    _playingSourceIsPlaying: function() {
      var playingSource = R.player.playingSource();
      return (this._playingSource && playingSource && playingSource.get('key') == this._playingSource.key);
    },

    // ----------
    _play: function(source, options) {
      var self = this;
      options = options || {};

      this._forceMaster(function() {
        var newSource = (source != self._playingSource);
        self._playingSource = source;

        if (!self._playingSourceIsPlaying()) {
          if (!options.replace) {
            R.player.queue.addPlayingSource();
          }

          R.player.play({ source: self._playingSource.key });
        } else {
          R.player.play();
        }

        var starting = !self._playing;
        self._playing = true;
        if (starting && self._onStart) {
          self._onStart();
        }

        if (newSource && self._onPlay) {
          self._onPlay(self._playingSource);
        }
      });
    },

    // ----------
    _forceMaster: function(continuation) {
      this._forceReady(function() {
        if (R.player.isMaster()) {
          continuation();
        } else {
          var handler = function(isMaster) {
            if (isMaster) {
              R.player.off('change:isMaster', handler);
              continuation();
            }
          };

          R.player.on('change:isMaster', handler);
          R.player.startMasterTakeover();
        }
      });
    },

    // ----------
    _forceReady: function(continuation) {
      if (R.ready()) {
        continuation();
      } else {
        R.ready(continuation);
      }
    }
  };

})(window.__rdio, window.rdioUtils);
