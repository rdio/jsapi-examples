// ----------------------------------------------------------------------------------
// rdioUtils -- local-queue.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.LocalQueue = function(config) {
    var self = this;

    this._onStart = config.onStart;
    this._onStop = config.onStop;
    this._onPlay = config.onPlay;
    this._onRemove = config.onRemove;
    this._keys = [];
    this._playing = false;
    this._playingKey = null;
    this._keyFromQueue = '';

    R.ready(function() {
      R.player.queue.on('remove', function(source, collection, info) {
        if (info.index === 0) {
          self._keyFromQueue = source.get('key');
        }
      });

      R.player.on('change:playingSource', function(playingSource) {
        if (self._playing) {
          if (!playingSource || playingSource.get('key') != self._playingKey) {
            if (playingSource.get('key') == self._keyFromQueue && self._keys.length) {
              self._play(self.remove());
            } else {
              self._playing = false;
              self._playingKey = null;
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

      var playingSource = R.player.playingSource();
      if (playingSource && playingSource.get('key') === this._playingKey) {
        R.player.nextSource();
      }

      this._playing = false;
      this._playingKey = null;
      if (this._onStop) {
        this._onStop();
      }
    },

    // ----------
    add: function(key) {
      this._keys.push(key);
    },

    // ----------
    remove: function(index) {
      index = index || 0;
      if (index >= this._keys.length) {
        return null;
      }

      var key = this._keys.splice(index, 1)[0];
      if (this._onRemove) {
        this._onRemove(key, index);
      }

      return key;
    },

    // ----------
    play: function() {
      if (this._playing) {
        return;
      }

      var key = this._playingKey || this.remove();
      if (!key) {
        return;
      }

      this._play(key);
    },

    // ----------
    next: function() {
      var self = this;

      if (!this._keys.length) {
        return;
      }

      this._forceReady(function() {
        var playingSource = R.player.playingSource();
        var key = self.remove();
        if (self._playingKey && playingSource && playingSource.get('key') == self._playingKey) {
          self._play(key, { replace: true });
        } else {
          self._play(key);
        }
      });
    },

    // ----------
    playing: function() {
      return this._playing;
    },

    // ----------
    _play: function(key, options) {
      var self = this;
      options = options || {};

      this._forceMaster(function() {
        var newKey = (key != self._playingKey);
        self._playingKey = key;

        var playingSource = R.player.playingSource();
        if (!playingSource || playingSource.get('key') != self._playingKey) {
          if (!options.replace) {
            R.player.queue.addPlayingSource();
          }

          R.player.play({ source: self._playingKey });
        } else {
          R.player.play();
        }

        var starting = !self._playing;
        self._playing = true;
        if (starting && self._onStart) {
          self._onStart();
        }

        if (newKey && self._onPlay) {
          self._onPlay(self._playingKey);
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
