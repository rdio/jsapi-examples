/*globals */

(function(R) {

  function dialog(message) {
    var body = document.getElementsByTagName('body')[0];
    var el = document.createElement('div');
    el.className = "rdio-utils-dialog";
    el.innerHTML = '<p>'
      + message
      + '</p><button>OK</button>';

    var button = el.getElementsByTagName('button')[0];

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
    }
  };
  
})(window.__rdio);  
