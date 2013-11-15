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
      var item = new Main.QueueItem(data);
      this.items.splice(index, 0, item);

      if (index === 0) {
        item.$el.prependTo(this.$el);
      } else {
        var $before = this.$el.find('.queue-item').eq(index - 1);
        if ($before.length) {
          item.$el.insertAfter($before);
        } else {
          item.$el.appendTo(this.$el);
        }
      } 

      return item;
    }
  };

})();
