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

      var downEventName = (Modernizr.touch) ? 'touchstart' : 'mousedown';
      var upEventName = (Modernizr.touch) ? 'touchend' : 'mouseup';
      var moveEventName = (Modernizr.touch) ? 'touchmove' : 'mousemove';
      
      var moveHandler = function(event) {
        var y;

        if (Modernizr.touch) {
          var touches = event.originalEvent.changedTouches;
          var touch = _.findWhere(touches, { identifier: drag.id });
          if (!touch) {
            return;
          }

          y = touch.clientY;
        } else {
          y = event.clientY;
        }

        var offset = y - drag.startY;
        self.$el.css({
          top: offset
        });

        if (offset < 0) {
          var count = Math.max(0, Math.floor((-offset - 40) / 80) + 1);
          drag.shift = -count;
          // console.log(count, offset);
          self.queue.shiftDown(self.queue.index(self) - 1, count);
        }

        event.preventDefault();
        event.stopPropagation();
      };

      var upHandler = function(event) {
        if (Modernizr.touch) {
          var touches = event.originalEvent.changedTouches;
          var touch = _.findWhere(touches, { identifier: drag.id });
          if (!touch) {
            return;
          }
        }

        self.queue.move(self, drag.shift);

        self.$el.css({
          top: 0
        });

        self.$el.unbind(moveEventName, moveHandler);
        self.$el.unbind(upEventName, upHandler);
        self.$el.removeClass('dragging');
        drag = null;

        event.preventDefault();
        event.stopPropagation();
      };

      this.$el.find('.grip')
        .bind(downEventName, function(event) {
          drag = {
            shift: 0
          };

          if (Modernizr.touch) {
            var touches = event.originalEvent.changedTouches;
            if (!touches.length) {
              return;
            }

            drag.startY = touches[0].clientY;
            drag.id = touches[0].identifier;
          } else {
            drag.startY = event.clientY;            
          }

          self.$el.bind(moveEventName, moveHandler);
          self.$el.bind(upEventName, upHandler);
          self.$el.addClass('dragging');
          event.preventDefault();
          event.stopPropagation();
        });
    }
  };

})();
