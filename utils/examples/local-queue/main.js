/*globals rdioUtils, Main, R */

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

      this.queue = rdioUtils.localQueue();

      this.collection = rdioUtils.collectionAlbums({
        localStorage: true,
        onAlbumsLoaded: function(albums) {
          self.log('onAlbumsLoaded: ' + albums.length + ' albums');
          self.queue.add(albums[0].key);
          self.queue.add(albums[1].key);
          self.queue.add(albums[2].key);
          self.queue.play();
        }
      });

      R.ready(function() {
        R.player.on('all', function(eventName) {
          if (eventName != 'change:position') {
            self.log('player: ' + eventName);
          }
        });

        R.player.queue.on('all', function(eventName, model) {
          if (model && model.attributes && model.attributes.artist) {
            eventName += ' ' + model.attributes.artist;
          }

          self.log('player.queue: ' + eventName);
        });
      });

      $('.stop')
        .click(function() {
          self.queue.destroy();
        });
    },

    // ----------
    log: function(message) {
      $('<p>')
        .text(message)
        .appendTo('.log');
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
