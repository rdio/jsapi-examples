// ----------------------------------------------------------------------------------
// rdioUtils -- local-queue.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.LocalQueue = function() {
    this._keys = [];
    this._playing = false;
  };

  // ----------
  rdioUtils.LocalQueue.prototype = {
    // ----------
    destroy: function() {
      if (!this._playing) {
        return;
      }

      R.player.nextSource();
      this._playing = false;
    },

    // ----------
    add: function(key) {
      this._keys.push(key);
    },

    // ----------
    play: function() {
      if (this._playing) {
        return;
      }

      var key1 = this._keys[0];
      var key2 = this._keys[1];

      var playingSourceHandler = function(playingSource) {
        if (playingSource && playingSource.get('key') == key1) {
          R.player.off('change:playingSource', playingSourceHandler);
          R.player.queue.on('add', queueAddHandler);
          R.player.queue.add(key2);
        }
      };

      var queueAddHandler = function(model, collection, info) {
        if (model.get('key') == key2) {
          R.player.queue.off('add', queueAddHandler);
          R.player.queue.move(info.index, 0);
        }
      };

      R.player.on('change:playingSource', playingSourceHandler);

      R.player.queue.addPlayingSource();
      R.player.play({ source: key1 });
      this._playing = true;
    }
  };

})(window.__rdio, window.rdioUtils);
