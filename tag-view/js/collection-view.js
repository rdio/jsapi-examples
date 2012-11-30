/*globals Main, R, Backbone */

(function() {

  Main.views.collection = {
    init: function() {
      var self = this;
      this.$el = $('#content');
      this.$albums = this.$el.find('.albums');
      this.$tags = this.$el.find('.tags');
      this.albumViews = [];
      
      Main.collection.on('add', function(album) {
        var albumView = new Main.Views.Album(album);
        self.$albums.append(albumView.$el);
        self.albumViews.push(albumView);
      });
      
      var debouncedRenderTags = _.debounce(_.bind(this.renderTags, this), 100);
      
      Main.tags.on('add', function(tag) {
        tag.get('albums').on('add', function() {
          debouncedRenderTags();
        });

        debouncedRenderTags();
      });
    },
    
    renderTags: function() {
      var self = this;
      self.$tags.empty();
      Main.tags.sort();
      Main.tags.each(function(v, i) {
        self.$tags.append('<p class="tag">' + v.get('name') + ' (' + v.get('albums').length + ')</p>');        
      });
    }
  };

})();
