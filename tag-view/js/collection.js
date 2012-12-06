/*globals Main, R, Backbone, amplify */

(function() {

  // ==========
  Main.collection = _.extend({
    // ----------
    initialize: function() {
      var self = this;
      this.start = 0;
      this.count = 100;
      this.max = 600;
      this.loading = false;
      this.done = false;
      this.models = {};
      this.length = 0;
      
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
    
    // ----------
    addAlbum: function(data) {
      if (!data.canStream) {
        return;
      }
      
      if (this.models[data.key]) {
        return;
      }
      
      var album = new Main.Models.Album(data);
      this.models[data.key] = album;
      this.length++;
      this.trigger('add', album);
      
      album.on('add:tag', _.debounce(_.bind(this.save, this), 10));
    },
    
    // ----------
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
            
            if (self.length < self.max) {
              self.loadMore();
            }
          } else {
            self.done = true;
          }
        }
      });      
    },
    
    // ----------
    save: function() {
      var data = {
        models: _.map(this.models, function(v, i) {
          return v.toJSON();
        })
      };
      
      amplify.store('albums', data);
    }
  }, Backbone.Events);

})();