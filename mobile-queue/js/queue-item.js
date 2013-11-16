(function() {

  // ----------
  var component = Main.QueueItem = function(data, queue) {
    var self = this;

    this.queue = queue;
    this.$el = Main.template('queue-item', data);
    this._shift = 0;
    this._drag = null;
    this._downEventName = (Modernizr.touch) ? 'touchstart' : 'mousedown';
    this._moveEventName = (Modernizr.touch) ? 'touchmove' : 'mousemove';
    this._upEventName = (Modernizr.touch) ? 'touchend' : 'mouseup';
    this._boundDownHandler = _.bind(this._downHandler, this);
    this._boundMoveHandler = _.bind(this._moveHandler, this);
    this._boundUpHandler = _.bind(this._upHandler, this);
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

      this.$el.find('.grip')
        .bind(this._downEventName, this._boundDownHandler);

      this.$el
        .bind(this._downEventName, function() {
          var $window = $(window);
          var scrollTop = $window.scrollTop();

          var timeout = setTimeout(function() {
            if (Math.abs($window.scrollTop() - scrollTop) > 5) {
              return;
            }

            Main.menu.show(self);
          }, 1000);

          var upHandler = function() {
            clearTimeout(timeout);
            $(window).unbind(this._upEventName, upHandler);
          };

          $(window).bind(this._upEventName, upHandler);
        });
    },

    // ----------
    _downHandler: function(event) {
      var drag = {
        shift: 0
      };

      if (Modernizr.touch) {
        var touches = event.originalEvent.changedTouches;
        if (!touches.length) {
          return;
        }

        drag.startY = touches[0].pageY;
        drag.id = touches[0].identifier;
      } else {
        drag.startY = event.pageY;            
      }

      drag.y = drag.startY;
      drag.oldY = drag.startY;

      this.queue.dragging = true;
      this._drag = drag;
      $(window).bind(this._moveEventName, this._boundMoveHandler);
      $(window).bind(this._upEventName, this._boundUpHandler);
      this.$el.addClass('dragging');
      event.preventDefault();
      event.stopPropagation();

      requestAnimationFrame(_.bind(this._scrollCheck, this));
    },

    // ----------
    _scrollCheck: function() {
      if (!this._drag) {
        return;
      }

      var $window = $(window);
      var wh = $window.height();
      var bodyHeight = $('body').height();
      var scrollTop = $window.scrollTop();
      var y = this._drag.y - scrollTop;
      var adjust = 0;
      if (y > wh - 80 && scrollTop < bodyHeight - wh) {
        adjust = Math.min((bodyHeight - wh) - scrollTop, 3);
      } else if (y < 80 && scrollTop > 0) {
        adjust = Math.max(-scrollTop, -3);
      } 

      if (adjust) {
        $window.scrollTop(scrollTop + adjust);
        this._drag.y += adjust;
      }

      this._updateForDrag();

      requestAnimationFrame(_.bind(this._scrollCheck, this));
    },

    // ----------
    _moveHandler: function(event) {
      if (Modernizr.touch) {
        var touches = event.originalEvent.changedTouches;
        var touch = _.findWhere(touches, { identifier: this._drag.id });
        if (!touch) {
          return;
        }

        this._drag.y = touch.pageY;
      } else {
        this._drag.y = event.pageY;
      }

      event.preventDefault();
      event.stopPropagation();
    },

    // ----------
    _updateForDrag: function() {
      if (this._drag.y === this._drag.oldY) {
        return;
      }

      this._drag.oldY = this._drag.y;

      var offset = this._drag.y - this._drag.startY;
      this.$el.css({
        top: offset
      });

      var count, start;
      if (offset < 0) {
        count = Math.max(0, Math.floor((-offset - 40) / 80) + 1);
        if (this._drag.shift !== -count) {
          this._drag.shift = -count;
          start = this.queue.index(this) - count;
          this.queue.shift(start, count, 1);          
        }
      } else {
        count = Math.max(0, Math.floor((offset - 40) / 80) + 1);
        if (this._drag.shift !== count) {
          this._drag.shift = count;
          start = this.queue.index(this) + 1;
          this.queue.shift(start, count, -1);          
        }
      }
    },

    // ----------
    _upHandler: function(event) {
      if (Modernizr.touch) {
        var touches = event.originalEvent.changedTouches;
        var touch = _.findWhere(touches, { identifier: this._drag.id });
        if (!touch) {
          return;
        }
      }

      this.$el.css({
        top: 0
      });

      $(window).unbind(this._moveEventName, this._boundMoveHandler);
      $(window).unbind(this._upEventName, this._boundUpHandler);
      this.$el.removeClass('dragging');

      this.queue.dragging = false;
      this.queue.move(this, this._drag.shift);
      this._drag = null;

      event.preventDefault();
      event.stopPropagation();
    }
  };

})();
