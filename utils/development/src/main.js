// ----------------------------------------------------------------------------------
// rdioUtils -- main.js
// Copyright 2013, Rdio, Inc.
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(R) {

  var verbose = false;

  // ----------
  var bind = function(element, eventName, handler) {
    if(element.addEventListener) {
      element.addEventListener(eventName, handler, true);
    } else {
      element.attachEvent("on" + eventName, handler);
    }
  };
  
  // ----------
  var unbind = function(element, eventName, handler) {
    if(element.removeEventListener) {
      element.removeEventListener(eventName, handler, true);
    } else {
      element.detachEvent("on" + eventName, handler);
    }
  };

  // ----------
  function dialog(message) {
    var body = document.getElementsByTagName('body')[0];
    var el = document.createElement('div');
    el.className = "rdio-utils-dialog";
    el.innerHTML = '<div>'
      + message
      + '</div><br><button>OK</button>';

    var button = el.getElementsByTagName('button')[0];
    bind(button, 'click', function() {
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
          bind(el, 'click', function() {
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
    // albumWidget: function(album) {
    //   var widget = new this.AlbumWidget(album);
    //   return widget.element();
    // },

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
