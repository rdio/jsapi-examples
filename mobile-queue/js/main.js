/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    // ----------
    init: function() {
      var self = this;

      if (!rdioUtils.startupChecks()) {
        return;
      }

      this.queue = new this.Queue();

      R.ready(function() {
        if (R.authenticated()) {
          self.start();
        } else {
          $('.unauthenticated').show();
          $('.auth').click(function() {
            R.authenticate(function() {
              if (R.authenticated()) {
                $('.unauthenticated').hide();
                self.start();
              }
            });
          });
        }
      });
    },

    // ----------
    start: function() {
      var self = this;

      $('.authenticated').show();

      this.updateNowPlaying();
      R.player.on('change:playingSource', this.updateNowPlaying, this);

      var doResetEnd = function() {
        self._queueReset = false;
        self.updateQueue();        
      };

      var timeout;
      var checkResetEnd = function() {
        if (R.player.queue.length() === self.queue.items.length) {
          doResetEnd();
          return;
        }

        clearTimeout(timeout);
        timeout = setTimeout(doResetEnd, 3000);
      };

      this.updateQueue();
      R.player.queue.on('reset', function() {
        if (self.queue.items.length) {
          self._queueReset = true;
          checkResetEnd();
        } else {
          self.updateQueue();
        }
      });
      
      R.player.queue.on('add', function(model, collection, info) {
        if (self._queueReset) {
          checkResetEnd();
        } else {
          self.newQueueItem(model.toJSON(), info.index);         
        }
      });

      R.player.queue.on('remove', function() {
        console.log('remove', arguments);
      });
    },

    // ----------
    updateNowPlaying: function() {
      var playingSource = R.player.playingSource();
      if (playingSource) {
        $('.now-playing img').prop('src', playingSource.get('icon'));        
      }
    },

    // ----------
    updateQueue: function() {
      // console.log('reset');
      this.queue.empty();
      $('.queue').empty();

      for (var i = 0; i < R.player.queue.length(); i++) {
        this.newQueueItem(R.player.queue.at(i).toJSON(), i);
      }
    },

    // ----------
    newQueueItem: function(data, index) {
      this.queue.newItem(data, index);
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
