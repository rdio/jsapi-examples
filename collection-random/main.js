/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    albums: [],

    // ----------
    init: function() {
      var self = this;

      this.currentAlbums = [];
      this.possibleAlbums = [];

      if (!rdioUtils.startupChecks()) {
        return;
      }

      rdioUtils.authWidget($('.auth'));

      R.on('change:authenticated', function(authenticated) {
        $('.authenticated, .shuffle').toggle(authenticated);
        $('.unauthenticated').toggle(!authenticated);
      });

      this.collection = rdioUtils.collectionAlbums({
        localStorage: true,
        onAlbumsLoaded: function(albums) {
          self.possibleAlbums = self.possibleAlbums.concat(albums);
          self.indicies = _.shuffle(_.range(self.possibleAlbums.length));
          if (!self.currentAlbums.length) {
            self.shuffle();
          }
        }
      });

      $('.shuffle')
        .click(function() {
          self.shuffle();
        });
    },

    // ----------
    shuffle: function() {
      var self = this;

      $('.albums').empty();
      this.currentAlbums = [];

      var addAlbum = function(album) {
        if (!album.canStream) {
          return;
        }

        self.currentAlbums.push(album);

        var widget = rdioUtils.albumWidget(album);
        var $widget = $(widget.element());
        $('.albums').append($widget);

        $('<div>')
          .addClass('btn yes')
          .click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            R.player.queue.add(album.key);
            $widget.fadeOut();
          })
          .appendTo($widget.find('.rdio-utils-album-hover-overlay'));
      };

      while (this.currentAlbums.length < 20 && this.indicies.length) {
        var index = this.indicies.pop();
        var album = this.possibleAlbums[index];
        addAlbum(album);
      }
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
