/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    $albums: {},

    // ----------
    init: function() {
      var self = this;
      
      this.firstTime = true;

      if (!rdioUtils.startupChecks()) {
        return;
      }

      rdioUtils.authWidget($('.auth'));

      this.queue = rdioUtils.localQueue();

      this.collection = rdioUtils.collectionAlbums({
        localStorage: true,
        onAlbumsLoaded: function(albums) {
          if (!self.firstTime) {
            return;
          }

          self.firstTime = false;

          var waitForQueue = function(model, collection, info) {
            if (model.get('artist') == 'Shapeshifter') {
              R.player.queue.off('add', waitForQueue);
              // self.queue.add('t1269882'); // 4 seconds
              // self.queue.add('t1269898'); // 11 seconds
              // self.queue.add('t1269926'); // 28 seconds
              self.queue.add(albums[0].key);
              self.queue.add(albums[1].key);
              self.queue.add(albums[2].key);
              self.log('start play');
              self.queue.play();
              self.log('after play');
            }
          };

          R.player.queue.on('add', waitForQueue);
        }
      });

      R.ready(function() {
        R.player.on('all', function(eventName, value) {
          if (eventName != 'change:position') {
            if (_.isObject(value) && value.attributes && value.attributes.name) {
              eventName += ' ' + value.attributes.name;
            } else {
              eventName += ' ' + value;
            }

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
