/*globals rdioUtils, Main */

(function() {

  // ----------
  window.Main = {
    $albums: {},

    // ----------
    init: function() {
      var self = this;
      
      if (!rdioUtils.startupChecks()) {
        return;
      }

      rdioUtils.authWidget($('.auth'));

      this.collection = rdioUtils.collectionAlbums({
        localStorage: true,
        onAlbumsLoaded: function(albums) {
          self.log('onAlbumsLoaded: ' + albums.length + ' albums');
          self.logAlbums(albums, '=');
        },
        onLoadComplete: function() {
          self.log('onLoadComplete: ' + self.collection.length + ' albums total');
        },
        onError: function(message) {
          self.log('onError: ' + message);
        },
        onAdded: function(albums) {
          self.log('onAdded: ' + albums.length + ' albums');
          self.logAlbums(albums, '+');
        },
        onRemoved: function(albums) {
          self.log('onRemoved: ' + albums.length + ' albums');
          self.logAlbums(albums, '-');
        }
      });
    },

    // ----------
    log: function(message) {
      $('<p>')
        .text(message)
        .appendTo('.log');
    },

    // ----------
    logAlbums: function(albums, prefix) {
      var self = this;

      _.each(albums, function(v, i) {
        v.prefix = prefix;
        self.template('album', v).appendTo('.log');
      });
    },

    // ----------
    template: function(name, config) {
      var rawTemplate = $.trim($("#" + name + "-template").text());
      var template = _.template(rawTemplate);
      var html = template(config);
      return $(html);
    }
  };

  // ----------
  $(document).ready(function() {
    Main.init();
  });

})();
