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
    this._nextKey = null;

    R.ready(function() {
      R.player.on('change:playingSource', function(playingSource) {
        if (playingSource && playingSource.get('key') === self._nextKey) {
          self._playingKey = self._nextKey;
          self._queueNext(self._keys.shift());
        }
      });
    });

    // if ("onpagehide" in window) {
    // rdioUtils._bind(window, 'pagehide', function() {
    //   self.destroy();
    // });
  };

  // ----------
  rdioUtils.LocalQueue.prototype = {
    // ----------
    destroy: function() {
      if (!this._playing) {
        return;
      }

      var queueSource = R.player.queue.at(0);
      if (queueSource && queueSource.get('key') === this._nextKey) {
        R.player.queue.remove(0);
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

      if (this._playing) {
        return;
      }

      this._playingKey = this._keys.shift();

      R.player.queue.addPlayingSource();
      R.player.play({ source: this._playingKey });
      this._queueNext(this._keys.shift());
      this._playing = true;
    },

    // ----------
    _queueNext: function(key) {
      var self = this;

      this._nextKey = key;

      var queueAddHandler = function(model, collection, info) {
        if (model.get('key') == self._nextKey) {
          R.player.queue.off('add', queueAddHandler);
          R.player.queue.move(info.index, 0);
        }
      };

      R.player.queue.on('add', queueAddHandler);
      R.player.queue.add(this._nextKey);
    }
  };

})(window.__rdio, window.rdioUtils);
