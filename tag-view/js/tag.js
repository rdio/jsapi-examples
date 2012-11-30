/*globals Main, R, Backbone, amplify */

(function() {

  Main.Models.Tag = Backbone.Model.extend({
    initialize: function() {
      this.set({
        albums: new Backbone.Collection()
      });
    },
    
    addAlbum: function(album) {
      this.get('albums').add(album);
    }
  });

  Main.Models.TagCollection = Backbone.Collection.extend({
    initialize: function() {
      var self = this;
      this.albumsToLoad = [];
      this.loading = false;
      var stored = amplify.store('tags');
      if (stored) {
        _.each(stored.tags, function(v, i) {
          var tag = new Main.Models.Tag(v);
          self.add(tag);
        });
      }
    },
    
    comparator: function(a, b) {
      var al = a.get('albums').length;
      var bl = b.get('albums').length;
      if (al > bl) {
        return -1;
      } else if (bl > al) {
        return 1;
      } else if (a.get('name') > b.get('name')) {
        return 1;
      } else {
        return -1;
      }
    },
    
    addAlbum: function(album) {
      this.albumsToLoad.push(album);
      if (!this.loading) {
        this.loadNextAlbum();
      }
/*       var tags = this.where() */
    },
    
    addTag: function(config) {
      var tags = this.where({
        name: config.name
      });
      
      var tag;
      if (tags.length) {
        tag = tags[0];
      } else {
        tag = new Main.Models.Tag({
          name: config.name
        });
        
        this.add(tag);
      }
      
      tag.addAlbum(config.album);

      return tag;
    },
    
    loadNextAlbum: function() {
      var self = this;
      
      if (this.loading) {
        return;
      }
      
      var album = this.albumsToLoad.shift();
      if (!album) {
        return;
      }
      
      this.loading = true;
      
      var url = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist='
        + encodeURIComponent(album.get('artist'))
        + '&album='
        + encodeURIComponent(album.get('name'))
        + '&api_key=c277ae1f0edb1b0aa6d1a2398c767d70&format=json&callback=?';
          
      $.getJSON(url, function (data) {
        self.loading = false;
        _.each(data.toptags.tag, function(v, i) {
          if (v.count >= 1) {
            self.addTag({
              name: v.name.toLowerCase(),
              album: album
            });
          }
        });
        
        self.loadNextAlbum();
      });
    }
    
  });

})();