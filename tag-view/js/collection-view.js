/*globals Main, R, Backbone */

(function() {

  Main.views.collection = {
    init: function() {
      var self = this;
      this.$el = $('#content');
      this.albumViews = [];
      
      Main.collection.on('add', function(album) {
        var albumView = new Main.Views.Album(album);
        self.$el.append(albumView.$el);
        self.albumViews.push(albumView);
      });
    }
  };

})();
