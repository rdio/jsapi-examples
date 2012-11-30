/*globals Main, R, Backbone */

(function() {

  Main.views.collection = {
    init: function() {
      var self = this;
      this.$el = $('#content');
      this.$albums = this.$el.find('.albums .inner');
      this.$tags = this.$el.find('.tags .inner');
      this.albumViews = [];
      
      this.$tags.on("click", ".tag", function(event) {
        var $target = $(event.target);
        self.selectTag($target.data('tag'));
        self.$el.find('.tag').not($target).removeClass('selected');
        $target.addClass('selected');
      });
      
      Main.collection.each(function(v, i) {
        self.addAlbum(v);
      });
      
      Main.collection.on('add', function(album) {
        self.addAlbum(album);
      });
      
      Main.tags.on('add change:count', _.debounce(_.bind(this.renderTags, this), 100));
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
        var count = v.get('count');
        if (count > 1) {
          var $tag = $('<p class="tag">' + v.get('name') + ' (' + count + ')</p>')
            .data('tag', v)
            .appendTo(self.$tags);
        }
      });
    },
    
    selectTag: function(tag) {
      _.each(this.albumViews, function(v, i) {
        v.toggle(tag.get('albums').indexOf(v.model) != -1);
      });
    }
  };

})();
