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
      && (album.type == 'a' || album.type == 'al'));

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

    // TODO: Escape all the values
    this._element.innerHTML = ''
        + '<div class="rdio-utils-album-cover">'
          + '<a href="http://www.rdio.com' + album.url + '" target="_blank">'
            + '<div class="rdio-utils-album-icon" style="background-image: url(' + album.icon + ')"></div>'
            + '<div class="rdio-utils-album-hover-overlay">'
              + '<div class="rdio-utils-album-play-btn"></div>'
              // + '<div class="rdio-utils-album-action-btn"></div>'
            + '</div>'
          + '</a>'
        + '</div>'
        + '<div class="rdio-utils-album-title rdio-utils-truncated"><a href="http://www.rdio.com' + album.url + '" target="_blank">' + album.name + '</a></div>'
        + '<div class="rdio-utils-album-author rdio-utils-truncated"><a href="http://www.rdio.com' + album.artistUrl + '" target="_blank">' + album.artist + '</a></div>'
        + '<div class="rdio-utils-album-size rdio-utils-truncated">' + album.length + ' songs</div>';

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
