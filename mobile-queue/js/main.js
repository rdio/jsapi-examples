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

      this.spin(true);

      R.ready(function() {
        self.spin(false);
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
        self.queue.reset();        
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

      this.queue.reset();
      R.player.queue.on('reset', function() {
        if (self.queue.items.length) {
          self._queueReset = true;
          checkResetEnd();
        } else {
          self.queue.reset();
        }
      });
      
      R.player.queue.on('add', function(model, collection, info) {
        if (self._queueReset) {
          checkResetEnd();
        } else {
          self.queue.newItem(model.toJSON(), info.index);         
        }
      });

      R.player.queue.on('remove', function(model, collection, info) {
        self.queue.remove(info.index);
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
    spin: function(value) {
      var $container = $('.spin-container');
      if (value) {
        $container.show();
        this.spinner = new Spinner().spin($container[0]);     
      } else {
        this.spinner.stop();
        $container.hide();
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
