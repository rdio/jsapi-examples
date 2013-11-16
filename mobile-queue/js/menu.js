(function() {

  // ----------
  var component = Main.Menu = function() {
    var self = this;

    $('.play-now').click(function() {

    });

    $('.play-next').click(function() {
      $('.menu').hide();

      if (self.queueItem) {
        Main.queue.move(self.queueItem, -Main.queue.index(self.queueItem));        
        self.queueItem = null;
      }
    });
  };

  // ----------
  component.prototype = {
    // ----------
    show: function(queueItem) {
      this.queueItem = queueItem;
      // $('.menu').show();
    },

    // ----------
    hide: function() {
      this.queueItem = null;
      $('.menu').hide();
    }
  };

})();
