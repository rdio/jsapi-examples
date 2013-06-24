/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    $albums: {},
    albums: [],

    // ----------
    init: function() {
      var self = this;
      
      if (!rdioUtils.startupChecks()) {
        return;
      }

      rdioUtils.authWidget($('.auth'));

      this.collection = rdioUtils.collectionAlbums({
        localStorage: true,
        onLoadComplete: function() {
          self.indicies = _.shuffle(_.range(self.collection.length));
          self.shuffle();
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
      this.albums = [];

      _.each(_.range(20), function(i) {
        var album = self.collection.at(self.indicies.pop());
        self.albums.push(album);
        var $album = self.template('album', album).appendTo('.albums');
        $album.find('img')
          .click(function() {
            R.player.queue.add(album.key);
            $album.fadeOut();
          });
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
