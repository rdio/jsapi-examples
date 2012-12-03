/*globals Main, R, Backbone, amplify */

(function() {

  Main.Models.Collection = Backbone.Collection.extend({
    initialize: function() {
      var self = this;
      this.start = 0;
      this.count = 300;
      this.loading = false;
      this.done = false;
      
      var stored = (Main.resetFlag ? null : amplify.store('albums'));
      if (stored && stored.models) {
        _.each(stored.models, function(v, i) {
          self.addAlbum(v);
        });
      }
      
      R.on('change:authenticated', function(authenticated) {
        if (authenticated) {
          self.loadMore();
        }
      });
    },
    
    addAlbum: function(data) {
      if (!data.canStream) {
        return;
      }
      
      var albums = this.where({key: data.key});
      if (albums.length) {
        return;
      }
      
      var album = new Main.Models.Album(data);
      this.add(album);
    },
    
    loadMore: function() {
      var self = this;
      if (this.loading || this.done) {
        return;
      }
      
      this.loading = true;
        
      R.request({
        method: "getAlbumsInCollection", 
        content: {
          user: R.currentUser.get("key"), 
          start: this.start,
          count: this.count,
          extras: "-*,artist,icon,name,shortUrl,canStream,url,key",
          sort: 'playCount'
        }, 
        complete: function(data) {
          self.loading = false;
          self.start += self.count;
          if (data && data.result && data.result.length) {
            _.each(data.result, function(v, i) {
              self.addAlbum(v);
            });

            self.save();
/*             self.loadMore(); */
          } else {
            self.done = true;
          }
        }
      });      
    },
    
    save: function() {
      amplify.store('albums', {
        models: this.toJSON()
      });
    }
  });

})();