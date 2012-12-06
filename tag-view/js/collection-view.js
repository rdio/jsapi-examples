/*globals Main, R, Backbone */

(function() {

  // ==========
  Main.Views.Collection = function() {
    var self = this;
    this.$el = $('#content');
    this.$albums = this.$el.find('.albums');
    this.$albumsInner = this.$el.find('.albums .inner');
    this.$allTags = this.$el.find('.tags');
    this.$albumTags = this.$el.find('.album-tags');
    this.$allTagsInner = this.$el.find('.tags .inner');
    this.$albumTagsInner = this.$el.find('.album-tags .inner');
    this.albumViews = [];
    this.selectedTag = null;
    
    this.$albumTags.hide();
    
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
      self.$albumTags.show();
      self.$albumTagsInner
        .empty()
        .append('<p><strong>Tags for ' + album.get('name') + ':</strong></p>');
      
      var tags = album.get('tags');
      if (!tags.length) {
        self.$albumTagsInner.append('<p>Not loaded yet</p>');  
      } else {
        _.each(tags, function(v, i) {
          self.$albumTagsInner.append('<p>' + v + '</p>');
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
      _.debounce(_.bind(self.updateAlbumCovers, self), 10);
    });
    
    Main.tags.on('add child:add:album', _.debounce(function() {
      self.renderTags();
      self.updateAlbums();
    }, 10));
    
    this.$albums
      .bind("scroll", _.debounce(_.bind(self.updateAlbumCovers, self), 100));

    this.renderTags();
    this.updateAlbumCovers();
  };
  
  Main.Views.Collection.prototype = {    
    // ----------
    addAlbum: function(album) {
      var albumView = new Main.Views.Album(album);
      albumView.$el.data('album', album);
      this.$albumsInner.append(albumView.$el);
      this.albumViews.push(albumView);      
    },
    
    // ----------
    renderTags: function() {
      var self = this;
      
      this.$allTagsInner.empty();
      
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
    
    // ----------
    renderTag: function(name, count, tag) {
      var $tag = $('<p class="tag">' + name + ' (' + count + ')</p>')
        .data('tag', tag)
        .toggleClass('selected', this.selectedTag == tag)
        .appendTo(this.$allTagsInner);
    },
    
    // ----------
    selectTag: function(tag) {
      this.selectedTag = tag;
      this.updateAlbums();
    },

    // ----------
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
        Work in progress for multi-tag select
        
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
      
      _.defer(_.bind(this.updateAlbumCovers, this));
    },
    
    // ----------
    updateAlbumCovers: function() {
      var wh = $(window).height();
      var coverHeight = 200; // Hardcoded here for speed, and because we don't expect it to change
      _.each(this.albumViews, function(v, i) {
        if (v.shown && !v.iconShown) {
          var pos = v.$el.position();
          if (pos.top < wh && pos.top + coverHeight > 0) {
            v.showIcon();
          }
        }
      });
    }
  };

})();
