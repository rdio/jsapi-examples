(function() {

  // ----------
  var component = Main.Queue = function() {
    this.items = [];
    this.$el = $('.queue');
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
      var index = this.index(item);
      var newIndex = Math.max(0, index + shift);

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
