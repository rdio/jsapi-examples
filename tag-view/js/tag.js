/*globals Main, R, Backbone, amplify */

(function() {

  // ==========
  Main.Models.Tag = Backbone.Model.extend({
    // ----------
    initialize: function() {
      if (!this.get('albumKeys')) {
        this.set({albumKeys: []});
      }
    },
    
    // ----------
    addAlbumKey: function(albumKey) {
      var albumKeys = this.get('albumKeys');
      if (_.indexOf(albumKeys, albumKey) == -1) {
        albumKeys.push(albumKey);
        this.trigger('add:album');
      }
    },
    
    // ----------
    toJSON: function() {
      return {
        name: this.get('name'),
        albumKeys: this.get('albumKeys')
      };
    }
  });

  // ==========
  Main.tags = _.extend({
    // ----------
    initialize: function() {
      var self = this;
      this.albumsToLoad = [];
      this.loading = false;
      this.blacklist = ['all', 'spotify'];
      this.models = {};
      this.length = 0;
      
      this.stored = (Main.resetFlag ? null : amplify.store('tags'));
      if (this.stored && this.stored.models) {
        _.each(this.stored.models, function(v, i) {
          self.addTag(v);
        });
      }
      
      R.ready(function() {
        self.loadNextAlbum();
      });
            
      this.on('add child:add:album', _.debounce(function() {
        self.save();
      }, 100));
    },
    
    // ----------
    addAlbum: function(album) {
      this.albumsToLoad.push(album);
      this.loadNextAlbum();
    },
    
    // ----------
    addTag: function(config) {
      var self = this;
      var tag = this.models[config.name];
      if (!tag) {
        tag = new Main.Models.Tag(config);
        this.models[config.name] = tag;
        this.length++;
        this.trigger('add', tag);
        
        tag.on('add:album', _.debounce(function() {
          self.trigger('child:add:album');
        }, 10)); 
      }
      
      return tag;
    },
    
    // ----------
    loadNextAlbum: function() {
      var self = this;
      
      if (this.loading || !R.ready()) {
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
        + '&api_key='
        + Main.lastfmKey
        + '&format=json&callback=?';
          
      $.getJSON(url, function (data) {
        self.loading = false;
        _.each(data.toptags.tag, function(v, i) {
          if (v.count >= 5) {
            var tagName = v.name.toLowerCase().replace('-', ' ');
            if (_.indexOf(self.blacklist, tagName) == -1 && tagName !== album.get('artist').toLowerCase()) {
              var tag = self.addTag({
                name: tagName
              });
              
              tag.addAlbumKey(album.get('key'));
              album.addTag(tagName);
            }
          }
        });
        
        self.loadNextAlbum();
      });
    },
    
    // ----------
    save: function() {
      amplify.store('tags', {
        models: _.map(this.models, function(v, i) {
          return v.toJSON();
        })
      });
    }
  }, Backbone.Events);

})();