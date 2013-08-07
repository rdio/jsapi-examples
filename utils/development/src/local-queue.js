// ----------------------------------------------------------------------------------
// rdioUtils -- local-queue.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.LocalQueue = function(config) {
    var self = this;

    this._onPlay = config.onPlay;
    this._onStop = config.onStop;
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
              self._play();
            } else {
              self._playing = false;
              if (self._onStop) {
                self._onStop();
              }
            }
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
      if (this._onStop) {
        this._onStop();
      }
    },

    // ----------
    add: function(key) {
      this._keys.push(key);
    },

    // ----------
    play: function() {
      if (this._playing || !this._keys.length) {
        return;
      }

      this._play();
    },

    // ----------
    next: function() {
      if (!this._keys.length) {
        return;
      }

      var playingSource = R.player.playingSource();
      if (this._playing && playingSource && playingSource.get('key') == this._playingKey) {
        this._playingKey = this._keys.shift();
        R.player.play({ source: this._playingKey });
      } else {
        this._play();
      }
    },

    // ----------
    _play: function() {
      var self = this;

      this._forceMaster(function() {
        self._playingKey = self._keys.shift();

        var playingSource = R.player.playingSource();
        if (!playingSource || playingSource.get('key') != self._playingKey) {
          R.player.queue.addPlayingSource();
        }

        R.player.play({ source: self._playingKey });

        var starting = !self._playing;
        self._playing = true;
        if (starting && self._onPlay) {
          self._onPlay();
        }
      });
    },

    // ----------
    _forceMaster: function(continuation) {
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
    }
  };

})(window.__rdio, window.rdioUtils);
