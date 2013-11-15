(function() {

  // ----------
  var component = Main.QueueItem = function(data) {
    var self = this;
    this.$el = Main.template('queue-item', data);

    var drag = null;

    var moveHandler = function(event) {
      var offset = event.clientY - drag.startY;
      self.$el.css({
        top: offset
      });

      if (offset < -40) {
        $('.queue .queue-item').eq(self.$el.index() - 1).animate({
          top: 80
        });
      }
    };

    var upHandler = function(event) {
      self.$el.unbind('mousemove', moveHandler);
      self.$el.unbind('mouseup', upHandler);
      self.$el.removeClass('dragging');
      drag = null;
    };

    this.$el.find('.grip')
      .mousedown(function(event) {
        drag = {
          startX: event.clientX,
          startY: event.clientY
        };

        self.$el.mousemove(moveHandler);
        self.$el.mouseup(upHandler);
        self.$el.addClass('dragging');
      });

  };

  // ----------
  component.prototype = {
  };

})();
