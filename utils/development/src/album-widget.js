// ----------------------------------------------------------------------------------
// rdioUtils -- album-widget.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R, rdioUtils) {

  // ----------
  rdioUtils.AlbumWidget = function(album) {
    // TODO: Verify album has what we need
    // TODO: Escape all the values
    // TODO: Reject sources that aren't albums
    // console.log(album);
    this._element = document.createElement('div');
    this._element.className = 'rdio-utils-album';
    this._element.innerHTML = ''
        + '<div class="rdio-utils-cover">'
          + '<a href="http://www.rdio.com' + album.url + '" target="_blank">'
            + '<div class="rdio-utils-icon" style="background-image: url(' + album.icon + ')"></div>'
          + '</a>'
          + '<div class="rdio-utils-play rdio-utils-btn"></div>'
        + '</div>'
        + '<div class="rdio-utils-title rdio-utils-truncated"><a href="http://www.rdio.com' + album.url + '" target="_blank">' + album.name + '</a></div>'
        + '<div class="rdio-utils-author rdio-utils-truncated"><a href="http://www.rdio.com' + album.artistUrl + '" target="_blank">' + album.artist + '</a></div>'
        + '<div class="rdio-utils-size rdio-utils-truncated">' + album.length + ' songs</div>';

    // this._element.innerHTML = '<div>'
    //   + message
    //   + '</div><br><button>OK</button>';

    // var button = this._element.getElementsByTagName('button')[0];
    // bind(button, 'click', function() {
    //   body.removeChild(this._element);
    // });

    // body.appendChild(this._element);
  };

  // ----------
  rdioUtils.AlbumWidget.prototype = {
    // ----------
    element: function() {
      return this._element;
    }
  };

})(window.__rdio, window.rdioUtils);
