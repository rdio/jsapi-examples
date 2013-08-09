/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    $albums: {},

    // ----------
    init: function() {
      var self = this;
      
      this.albums = [];
      this.albumsByTrackKey = {};

      if (!rdioUtils.startupChecks()) {
        return;
      }

      this.queue = rdioUtils.localQueue({
        onPlay: function() {
          // self.log('onPlay');
          $('.skip').prop('disabled', false);
          $('.stop').text('Stop');
        },
        onStop: function() {
          // self.log('onStop');
          $('.skip').prop('disabled', true);
          $('.stop').text('Play');
        }
      });

      R.ready(function() {
        // self.startLogging();

        R.player.on('change:playingSource', function(playingSource) {
          var album = null;
          if (playingSource) {
            var key = playingSource.get('key');
            album = self.albumsByTrackKey[key];
          }

          if (album) {
            $('.album').html(rdioUtils.albumWidget(album).element());
          } else {
            $('.album').empty();
          }
        });

        R.request({
          method: 'getNewReleases',
          content: {
            count: 100
          },
          success: function(data) {
            self.albums = data.result;

            _.each(self.albums, function(v, i) {
              var key = v.trackKeys[0];
              self.queue.add(key);
              self.albumsByTrackKey[key] = v;
            });

            self.queue.play();
            $('.loading').hide();
            $('.controls').fadeIn();
          }
        });

        $('.stop')
          .click(function() {
            if (self.queue.playing()) {
              self.queue.stop();
            } else {
              self.queue.play();
            }
          });

        $('.skip')
          .click(function() {
            R.player.position(R.player.playingTrack().get('duration') - 15);
          });

        $('.next')
          .click(function() {
            self.queue.next();
          });
      });
    },

    // ----------
    startLogging: function() {
      var self = this;

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
