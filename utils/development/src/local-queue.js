// ----------------------------------------------------------------------------------
// rdioUtils -- local-queue.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.LocalQueue = function() {
    var self = this;

    this._keys = [];
    this._playing = false;
    this._playingKey = null;

    R.ready(function() {
      R.player.on('change:playingSource', function(playingSource) {
        if (self._playing) {
          if (!playingSource || playingSource.get('key') != self._playingKey) {
            self._playing = false;
            self.play();
          }
        }
      });
    });
  };

  // ----------
  rdioUtils.LocalQueue.prototype = {
    // ----------
    destroy: function() {
      if (!this._playing) {
        return;
      }

      var playingSource = R.player.playingSource();
      if (playingSource && playingSource.get('key') === this._playingKey) {
        R.player.nextSource();
      }

      this._playing = false;
    },

    // ----------
    add: function(key) {
      this._keys.push(key);
    },

    // ----------
    play: function() {
      var self = this;

      if (this._playing || !this._keys.length) {
        return;
      }

      this._forceMaster(function() {
        self._playingKey = self._keys.shift();

        R.player.queue.addPlayingSource();
        R.player.play({ source: self._playingKey });
        self._playing = true;
      });
    },

    // ----------
    next: function() {
      var playingSource = R.player.playingSource();
      if (this._playing && playingSource && playingSource.get('key') == this._playingKey && this._keys.length) {
        this._playingKey = this._keys.shift();
        R.player.play({ source: this._playingKey });
      } else {
        this.play();
      }
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
