/*globals Main, R, Backbone */

(function() {

  Main.Models.Collection = Backbone.Collection.extend({
    initialize: function() {
      var self = this;
      this.start = 0;
      this.count = 100;
      this.loading = false;
      this.done = false;
      
      R.on('change:authenticated', function(authenticated) {
        if (authenticated) {
          self.loadMore();
        }
      });
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
              if (!v.canStream) {
                return;
              }
              
              var album = new Main.Models.Album(v);
              self.add(album);
            });
            
            self.loadMore();
          } else {
            self.done = true;
          }
        }
      });      
    }
  });

})();