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

      this.downEventName = (Modernizr.touch) ? 'touchstart' : 'mousedown';
      this.moveEventName = (Modernizr.touch) ? 'touchmove' : 'mousemove';
      this.upEventName = (Modernizr.touch) ? 'touchend' : 'mouseup';

      this.queue = new this.Queue();
      this.menu = new this.Menu();

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
      R.player.on('change:playingSource', function() {
        self.updateNowPlaying();
      });

      this.queue.reset();
      this._firstReset = true;
      R.player.queue.on('reset add remove', function() {
        self.triggerReset();
      });
    },

    // ----------
    triggerReset: function() {
      var self = this;

      var doResetEnd = function() {
        self.queue.reset();   
        self._firstReset = false;     
      };

      var checkResetEnd = function() {
        clearTimeout(self._resetTimeout);

        if (self._firstReset) {
          if ((self.queue.items.length === 0 && R.player.queue.length() === 5) 
              || (R.player.queue.length() - self.queue.items.length >= 20)) {
            self.queue.reset();
          }
        }

        self._resetTimeout = setTimeout(doResetEnd, 2000);
      };

      checkResetEnd();
    },

    // ----------
    updateNowPlaying: function(data) {
      if (!data) {
        var playingSource = R.player.playingSource();
        if (playingSource) {  
          data = playingSource.toJSON();
        }
      }

      if (data) {
        $('.now-playing img').prop('src', data.icon);
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
