(function() {

  // ----------
  var component = Main.QueueItem = function(data, queue) {
    var self = this;

    this.queue = queue;
    this.$el = Main.template('queue-item', data);
    this._shift = 0;
  };

  // ----------
  component.prototype = {
    // ----------
    shift: function(shift, immediately) {
      if (this._shift === shift) {
        return;
      }

      var css = {
        top: 80 * shift
      };

      if (immediately) {
        this.$el.stop().css(css);
      } else {
        this.$el.stop().animate(css);
      }

      this._shift = shift;
    },

    // ----------
    bindEvents: function() {
      var self = this;
      var drag = null;

      var moveHandler = function(event) {
        var offset = event.clientY - drag.startY;
        self.$el.css({
          top: offset
        });

        if (offset < 0) {
          var count = Math.max(0, Math.floor((-offset - 40) / 80) + 1);
          drag.shift = -count;
          // console.log(count, offset);
          self.queue.shiftDown(self.queue.index(self) - 1, count);
        }
      };

      var upHandler = function(event) {
        self.queue.move(self, drag.shift);

        self.$el.css({
          top: 0
        });

        self.$el.unbind('mousemove', moveHandler);
        self.$el.unbind('mouseup', upHandler);
        self.$el.removeClass('dragging');
        drag = null;
      };

      this.$el.find('.grip')
        .mousedown(function(event) {
          drag = {
            startX: event.clientX,
            startY: event.clientY,
            shift: 0
          };

          self.$el.mousemove(moveHandler);
          self.$el.mouseup(upHandler);
          self.$el.addClass('dragging');
        });
    }
  };

})();
