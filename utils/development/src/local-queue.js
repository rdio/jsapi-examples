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
            if ((!playingSource || playingSource.get('key') == self._keyFromQueue) && self._sources.length) {
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
