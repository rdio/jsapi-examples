/*globals rdioUtils, Main */

(function() {

  window.Main = {
    $albums: {},

    // ----------
    init: function() {
      var self = this;
      // if (!rdioUtils.startupChecks()) {
        // return;
      // }

      rdioUtils.authWidget($('.auth'));

      this.collection = rdioUtils.trackCollection({
        localStorage: true,
        onAlbumsLoaded: function(albums) {
          self.log('onAlbumsLoaded: ' + albums.length + ' albums');
          // self.addAlbums(albums);
        },
        onAdded: function(albums) {
          self.log('onAdded: ' + albums.length + ' albums');
          _.each(albums, function(v, i) {
            self.log('+ ' + v.name + ' by ' + v.artist);
          });

          // self.addAlbums(albums);
        },
        onRemoved: function(albums) {
          self.log('onRemoved: ' + albums.length + ' albums');
          _.each(albums, function(v, i) {
            self.log('- ' + v.name + ' by ' + v.artist);
          });

          // self.removeAlbums(albums);
        },
        onLoadComplete: function() {
          self.log('onLoadComplete: ' + self.collection.length + ' albums total');
        },
        onError: function(message) {
          self.log('onError: ' + message);
        }
      });
    },

    // ----------
    addAlbums: function(albums) {
      var self = this;

      var $content = $('.content');
      _.each(albums, function(v, i) {
        self.$albums[v.key] = $('<img>')
          .addClass('album')
          .prop('src', v.icon)
          .appendTo($content);
      });
    },

    // ----------
    removeAlbums: function(albums) {
      var self = this;

      _.each(albums, function(v, i) {
        self.$albums[v.key].remove();
      });
    },

    // ----------
    log: function(message) {
      $('<p>')
        .text(message)
        .appendTo('.log');
    },

    // ----------
    // For testing purposes only
    _chop: function(count) {
      var self = this;

      var remove = this.collection._albums.slice(0, count);
      this.collection._albums = this.collection._albums.slice(count);
      _.each(remove, function(v, i) {
        delete self.collection._albumsByKey[v.key];
      });

      this.collection._startLoad();
    }
  };

  $(document).ready(function() {
    Main.init();
  });

})();
