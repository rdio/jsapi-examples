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
        onStart: function() {
          $('.skip').prop('disabled', false);
          $('.toggle').text('Stop');
        },
        onStop: function() {
          $('.skip').prop('disabled', true);
          $('.toggle').text('Play');
          $('.playing-track').empty();
        },
        onPlay: function(source) {
          $('.playing-track').empty();
          var album = self.albumsByTrackKey[source.key];
          if (album) {
            self.template('playing-track', album).appendTo('.playing-track');
          }
        },
        onAdd: function(source, index) {
          var album = self.albumsByTrackKey[source.key];
          if (album) {
            source.$el = self.template('queue-track', album);

            source.$el.find('.remove')
              .click(function() {
                self.queue.remove(source);
              });

            source.$el.find('.play')
              .click(function() {
                self.queue.play(source);
              });

            source.$el.find('.top')
              .click(function() {
                self.queue.remove(source);
                self.queue.add(source.key, 0);
              });

            if (index === 0) {
              source.$el.prependTo('.queue-tracks');
            } else {
              var sourceBefore = self.queue.at(index - 1);
              if (sourceBefore && sourceBefore.$el) {
                source.$el.insertAfter(sourceBefore.$el);
              }
            }
          }
        },
        onRemove: function(source, index) {
          if (source.$el) {
            source.$el.remove();
            source.$el = null;
          }
        }
      });

      R.ready(function() {
        // self.startLogging();

        R.request({
          method: 'getNewReleases',
          content: {
            count: 30,
            extras: 'tracks'
          },
          success: function(data) {
            self.albums = data.result;

            _.each(self.albums, function(v, i) {
              var key = v.trackKeys[0];
              self.albumsByTrackKey[key] = v;
              self.queue.add(key);
            });

            $('.loading').hide();
            $('.controls').fadeIn();
          }
        });

        $('.toggle')
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

        $('.clear')
          .click(function() {
            self.queue.clear();
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
