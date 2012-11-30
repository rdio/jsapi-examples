/*globals Main, R, Backbone */

(function() {

  Main.views.collection = {
    init: function() {
      var self = this;
      this.$el = $('#content');
      this.$albums = this.$el.find('.albums');
      this.$tags = this.$el.find('.tags');
      this.albumViews = [];
      
      Main.collection.each(function(v, i) {
        self.addAlbum(v);
      });
      
      Main.collection.on('add', function(album) {
        self.addAlbum(album);
      });
      
      var debouncedRenderTags = _.debounce(_.bind(this.renderTags, this), 100);
      
      Main.tags.on('add', function(tag) {
        tag.get('albums').on('add', function() {
          debouncedRenderTags();
        });

        debouncedRenderTags();
      });
      
      this.renderTags();
    },
    
    addAlbum: function(album) {
      var albumView = new Main.Views.Album(album);
      this.$albums.append(albumView.$el);
      this.albumViews.push(albumView);
    },
    
    renderTags: function() {
      var self = this;
      self.$tags.empty();
      Main.tags.sort();
      Main.tags.each(function(v, i) {
        var count = v.get('albums').length;
        if (count > 1) {
          self.$tags.append('<p class="tag">' + v.get('name') + ' (' + count + ')</p>');        
        }
      });
    }
  };

})();
