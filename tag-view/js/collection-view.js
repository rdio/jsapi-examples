/*globals Main, R, Backbone */

(function() {

  Main.views.collection = {
    init: function() {
      var self = this;
      this.$el = $('#content');
      this.$albums = this.$el.find('.albums .inner');
      this.$tags = this.$el.find('.tags .inner');
      this.albumViews = [];
      this.selectedTag = null;
      
      this.$tags.on("click", ".tag", function(event) {
        var $target = $(event.target);
        self.selectTag($target.data('tag'));
        self.$el.find('.tag').not($target).removeClass('selected');
        $target.addClass('selected');
      });
      
      _.each(Main.collection.models, function(v, k) {
        self.addAlbum(v);
      });
      
      Main.collection.on('add', function(album) {
        self.addAlbum(album);
      });
      
      Main.tags.on('add change:count', _.debounce(function() {
        self.renderTags();
        self.updateAlbums();
      }, 10));
      
      this.renderTags();
        
      _.defer(function() {
        Main.tags._loadStored();
      });
    },
    
    addAlbum: function(album) {
      var albumView = new Main.Views.Album(album);
      this.$albums.append(albumView.$el);
      this.albumViews.push(albumView);
    },
    
    renderTags: function() {
      var self = this;
      
      this.$tags.empty();
      
      this.renderTag('all', Main.collection.length, null);
      
      Main.tags.sort();
      Main.tags.each(function(v, i) {
        var count = v.get('count');
        if (count > 1) {
          self.renderTag(v.get('name'), count, v);
        }
      });
    },
    
    renderTag: function(name, count, tag) {
      var $tag = $('<p class="tag">' + name + ' (' + count + ')</p>')
        .data('tag', tag)
        .toggleClass('selected', this.selectedTag == tag)
        .appendTo(this.$tags);
    },
    
    selectTag: function(tag) {
      this.selectedTag = tag;
      this.updateAlbums();
    },

    updateAlbums: function() {
      var tag = this.selectedTag;
      _.each(this.albumViews, function(v, i) {
        var show = (!tag || tag.get('albums').indexOf(v.model) != -1);
        v.toggle(show);
      });
    }
  };

})();
