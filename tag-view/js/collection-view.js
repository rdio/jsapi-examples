/*globals Main, R, Backbone */

(function() {

  Main.views.collection = {
    init: function() {
      var self = this;
      this.$el = $('#content');
      this.$albums = this.$el.find('.albums .inner');
      this.$tags = this.$el.find('.tags .inner');
      this.$albumTags = this.$el.find('.album-tags');
      this.$allTags = this.$el.find('.all-tags');
      this.albumViews = [];
      this.selectedTag = null;
      
      this.$allTags.on("click", ".tag", function(event) {
        var $target = $(event.target);
        self.selectTag($target.data('tag'));
        self.$el.find('.tag').not($target).removeClass('selected');
        $target.addClass('selected');
      });
      
      this.$albums.on('mouseenter', '.album', function(event) {
        var $album = $(event.currentTarget);        
        var album = $album.data('album');

        self.$allTags.hide();
        self.$albumTags
          .show()
          .empty()
          .append('<p><strong>Tags for ' + album.get('name') + ':</strong></p>');
        
        var tags = album.get('tags');
        if (!tags.length) {
          self.$albumTags.append('<p>Not loaded yet</p>');  
        } else {
          _.each(tags, function(v, i) {
            self.$albumTags.append('<p>' + v + '</p>');
          });
        }
      });
      
      this.$albums.on('mouseleave', '.album', function(event) {
        self.$allTags.show();
        self.$albumTags.hide();
      });
      
      _.each(Main.collection.models, function(v, k) {
        self.addAlbum(v);
      });
      
      Main.collection.on('add', function(album) {
        self.addAlbum(album);
        self.updateAlbumCovers();
      });
      
      Main.tags.on('add change:count', _.debounce(function() {
        self.renderTags();
        self.updateAlbums();
      }, 10));
      
      this.renderTags();
      this.updateAlbumCovers();
    },
    
    addAlbum: function(album) {
      var albumView = new Main.Views.Album(album);
      albumView.$el.data('album', album);
      this.$albums.append(albumView.$el);
      this.albumViews.push(albumView);      
    },
    
    renderTags: function() {
      var self = this;
      
      this.$allTags.empty();
      
      this.renderTag('all', Main.collection.length, null);
      
      var tags = _.map(Main.tags.models, function(v, k) {
        return {
          name: k,
          count: v.get('albumKeys').length,
          tag: v
        };
      });
      
      tags.sort(function(a, b) {
        if (a.count > b.count) {
          return -1;
        } else if (b.count > a.count) {
          return 1;
        } else if (a.name > b.name) {
          return 1;
        } else {
          return -1;
        }
      });
      
      _.each(tags, function(v, i) {
        var count = v.count;
        if (count > 1) {
          self.renderTag(v.name, count, v.tag);
        }
      });
    },
    
    renderTag: function(name, count, tag) {
      var $tag = $('<p class="tag">' + name + ' (' + count + ')</p>')
        .data('tag', tag)
        .toggleClass('selected', this.selectedTag == tag)
        .appendTo(this.$allTags);
    },
    
    selectTag: function(tag) {
      this.selectedTag = tag;
      this.updateAlbums();
    },

    updateAlbums: function() {
      var self = this;
      var tag = this.selectedTag;
      
/*
      this.shownAlbums = [];
      this.shownTags = {};
*/
      
      _.each(this.albumViews, function(v, i) {
        var show = (!tag || tag.get('albumKeys').indexOf(v.model.get('key')) != -1);
        v.toggle(show);
/*
        if (show) {
          self.shownAlbums.push(v.model);
          _.each(v.model.get('tags'), function(v2, i2) {
            var tag2 = self.shownTags[v2];
            if (!tag2) {
              tag2 = {
                count: 0
              };
              
              self.shownTags[v2] = tag2;
            }
            
            tag2.count++;
          });
        }
*/
      });

      this.updateAlbumCovers();
    },
    
    updateAlbumCovers: function() {
/*
      var wh = $(window).height();
      _.each(this.albumViews, function(v, i) {
        var pos = v.$el.position();
        if (pos.top < wh) {
          if (!$album.css('background-image')) {
            v.$cover.css('background-image', v.model.get('icon'));
          }
        }
      });
*/
    }
  };

})();
