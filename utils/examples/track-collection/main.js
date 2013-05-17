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
          self.addAlbums(albums);
        },
        onAdded: function(albums) {
          self.addAlbums(albums);
        },
        onRemoved: function(albums) {
          self.removeAlbums(albums);
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
    }
  };

  $(document).ready(function() {
    Main.init();
  });

})();
