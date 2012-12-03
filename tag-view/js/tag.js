/*globals Main, R, Backbone, amplify */

(function() {

  Main.Models.Tag = Backbone.Model.extend({
    defaults: {
      albumKeys: []
    },
    
    initialize: function() {
      var self = this;

      var albums = new Backbone.Collection();

      this.set({albums: albums});
      this.set({count: this._albumCount()});

      albums.on('add', function() {
        self.set({count: self._albumCount()});
      });
    },
    
    addAlbum: function(album) {
      var albums = this.get('albums');
      if (albums.indexOf(album) == -1) {
        albums.add(album);
      }
    },
    
    _albumCount: function() {
      return Math.max(this.get('albumKeys').length, this.get('albums').length);
    },
    
    toJSON: function() {
      return {
        name: this.get('name'),
        albumKeys: this.get('albums').map(function(v, i) {
          return v.get('key');
        })
      };
    }
  });

  Main.Models.TagCollection = Backbone.Collection.extend({
    initialize: function() {
      var self = this;
      this.albumsToLoad = [];
      this.loading = false;
      this.blacklist = ['all', 'spotify'];
      
      this.stored = (Main.resetFlag ? null : amplify.store('tags'));
      
/*
      R.ready(function() {
        self._loadStored();
      });
*/
            
      this.on('add change:count', _.debounce(function() {
        self.save();
      }, 100));
    },
    
    _loadStored: function() {
      if (!this.stored || !this.stored.models || !this.stored.models.length) {
        this.stored = null;
        this.loadNextAlbum();
        return;
      }
      
      for(var i = 0; i < 50; i++) {
        this._loadOneStored();
      }
      
      _.delay(_.bind(this._loadStored, this), 100);
    },
    
    _loadOneStored: function() {
      var self = this;
      var data = this.stored.models.shift();
      if (data) {
        var tag = new Main.Models.Tag(data);
        this.add(tag);
        _.each(tag.get('albumKeys'), function(key) {
          var album = Main.collection.models[key];
          if (album) {
            tag.addAlbum(album);
            var index = _.indexOf(self.albumsToLoad, album);
            if (index != -1) {
              self.albumsToLoad.splice(index, 1);
            }
          }
        });
      }
    },
    
    comparator: function(a, b) {
      var al = a.get('count');
      var bl = b.get('count');
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
      var tags = this.filter(function(v, i) {
        return _.indexOf(v.get('albumKeys'), album.get('key')) != -1;
      });
      
      if (tags.length) {
        _.each(tags, function(v, i) {
          v.addAlbum(album);
        });
      } else {
        this.albumsToLoad.push(album);
        this.loadNextAlbum();
      }
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
      
      if (this.loading || this.stored || !R.ready()) {
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
          if (v.count >= 3) {
            var tagName = v.name.toLowerCase().replace('-', ' ');
            if (_.indexOf(self.blacklist, tagName) == -1) {
              self.addTag({
                name: tagName,
                album: album
              });
            }
          }
        });
        
        self.loadNextAlbum();
      });
    },
    
    save: function() {
      amplify.store('tags', {
        models: this.toJSON()
      });
    }
  });

})();