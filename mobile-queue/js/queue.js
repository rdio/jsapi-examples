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
    index: function(item) {
      return _.indexOf(this.items, item);
    },

    // ----------
    shiftDown: function(index, count) {
      // console.log(index, count);
      if (count <= 0) {
        return;
      }

      var section = this.items.slice(index - (count - 1), index + 1);
      _.each(section, function(v, i) {
        v.shift(1);
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
