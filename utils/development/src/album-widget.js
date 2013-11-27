// ----------------------------------------------------------------------------------
// rdioUtils -- album-widget.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  var linkClickHandler = function(event) {
    var isMac = /mac/i.test(navigator.userAgent);
    if ((!isMac && event.ctrlKey) || (isMac && event.metaKey)) {
      return;
    }

    rdioUtils._stopEvent(event);
    R.router.navigate(event.currentTarget.href);
  };

  // ----------
  rdioUtils.AlbumWidget = function(album) {
    var i;

    this._element = document.createElement('div');
    this._element.className = 'rdio-utils-album';

    this._broken = false;

    if (album) {
      if (album.key && !/^(a|al)[0-9]/.test(album.key)) {
        rdioUtils._error('[rdioUtils] Bad key for album widget: ' + album.key);
        this._broken = true;
      }

      var required = ['url', 'icon', 'name', 'artist', 'artistUrl', 'key'];
      for (i = 0; i < required.length; i++) {
        if (!album[required[i]]) {
          rdioUtils._error('[rdioUtils] Missing ' + required[i] + ' for album widget', album);
          this._broken = true;
        }
      }
    } else {
      rdioUtils._error('[rdioUtils] Album is required for album widget');
      this._broken = true;
    }

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

    var html = ''
        + '<div class="rdio-utils-album-cover">'
          + '<a href="http://www.rdio.com' + rdioUtils._escape(album.url) + '">'
            + '<div class="rdio-utils-album-icon" style="background-image: url(' + rdioUtils._escape(album.icon) + ')"></div>'
            + '<div class="rdio-utils-album-hover-overlay">'
              + '<div class="rdio-utils-album-play-btn"></div>'
              // + '<div class="rdio-utils-album-action-btn"></div>'
            + '</div>'
          + '</a>'
        + '</div>'
        + '<div class="rdio-utils-album-title rdio-utils-truncated"><a href="http://www.rdio.com' + rdioUtils._escape(album.url) + '">' + rdioUtils._escape(album.name) + '</a></div>'
        + '<div class="rdio-utils-album-author rdio-utils-truncated"><a href="http://www.rdio.com' + rdioUtils._escape(album.artistUrl) + '">' + rdioUtils._escape(album.artist) + '</a></div>';

    if (album.length) {
      html += '<div class="rdio-utils-album-size rdio-utils-truncated">' 
        + rdioUtils._escape(album.length) + ' songs</div>'; 
    }

    this._element.innerHTML = html;

    var links = this._element.getElementsByTagName('a');
    for (i = 0; i < links.length; i++) {
      rdioUtils._bind(links[i], 'click', linkClickHandler);
    }

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
