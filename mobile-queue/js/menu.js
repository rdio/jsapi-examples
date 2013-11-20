(function() {

  // ----------
  var component = Main.Menu = function() {
    var self = this;

    this.$el = $('.menu');
    this.shown = false;

    var map = {
      'play-now': function() {
        Main.queue.playNow(self.queueItem);        
      }, 
      'play-next': function() {
        Main.queue.playNext(self.queueItem);        
      },       
      'move-to-bottom': function() {
        Main.queue.moveToBottom(self.queueItem);        
      },       
      'remove': function() {
        Main.queue.remove(self.queueItem);        
      }    
    };

    _.each(map, function(v, k) {
      $('.' + k).click(function() {
        self.$el.hide();

        if (self.queueItem) {
          v();
          self.queueItem = null;
        }        
      });
    });

    $(window).bind(Main.downEventName, function(event) {
      if (self.shown && $(event.target).closest('.menu').length === 0) {
        self.hide();
      }
    });
  };

  // ----------
  component.prototype = {
    // ----------
    show: function(queueItem) {
      this.queueItem = queueItem;

      this.$el.show();

      var h = this.$el.height();
      var y = this.queueItem.$el.offset().top - $(window).scrollTop();
      y += this.queueItem.$el.height() / 2;
      y -= h / 2;
      y = Math.max(10, Math.min($(window).height() - (h + 10), y));
      this.$el.css({ top: y });

      this.shown = true;
    },

    // ----------
    hide: function() {
      this.shown = false;
      this.queueItem = null;
      $('.menu').hide();
    }
  };

})();
