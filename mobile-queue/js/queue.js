(function() {

  // ----------
  var component = Main.Queue = function() {
    this.items = [];
    this.$el = $('.queue');
    this.dragging = false;
  };

  // ----------
  component.prototype = {
    // ----------
    newItem: function(data, index) {
      var item = new Main.QueueItem(data, this);
      this.items.splice(index, 0, item);
      this.insertAt(item, index);
      return item;
    },

    // ----------
    empty: function() {
      this.items = [];
    },

    // ----------
    reset: function() {
      if (this.dragging) {
        this._pendingReset = true;
        return;
      }

      this._pendingReset = false;
      this.empty();
      $('.queue').empty();

      for (var i = 0; i < R.player.queue.length(); i++) {
        this.newItem(R.player.queue.at(i).toJSON(), i);
      }
    },

    // ----------
    remove: function(index) {
      var item = this.items[index];
      this.items.splice(index, 1);
      if (item) {
        item.$el.remove();        
      }
    },

    // ----------
    index: function(item) {
      return _.indexOf(this.items, item);
    },

    // ----------
    shift: function(start, count, shift) {
      var last = start + (count - 1);
      _.each(this.items, function(v, i) {
        v.shift(i >= start && i <= last ? shift : 0);
      });
    },

    // ----------
    move: function(item, shift) {
      if (!shift) {
        return;
      }

      var index = this.index(item);

      if (this._pendingReset) {
        this.reset();
      }

      item = this.items[index];
      if (!item) {
        return;
      }

      var newIndex = Math.min(this.items.length - 1, Math.max(0, index + shift));

      this.items.splice(index, 1);
      this.items.splice(newIndex, 0, item);

      item.$el.remove();
      this.insertAt(item, newIndex);
      _.each(this.items, function(v, i) {
        v.shift(0, true);
      });

      R.player.queue.move(index, newIndex);
    },

    // ----------
    insertAt: function(item, index) {
      if (index === 0) {
        item.$el.prependTo(this.$el);
      } else {
        var $items = this.$el.find('.queue-item');
        var $before = $items.eq(index - 1);
        if ($before.length) {
          item.$el.insertAfter($before);
        } else {
          console.error('Bad insertion point: ' + index + ' in ' + $items.length + ' item list');
        }
      } 

      item.bindEvents();
    }
  };

})();
