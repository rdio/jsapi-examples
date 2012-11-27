/*globals Main, R, Album */

Main.views.collection = {
  init: function() {
    var self = this;
    this.start = 0;
    this.count = 100;
    this.loading = false;
    this.done = false;
    this.$el = $("#collection");
    this.$albums = this.$el.find(".albums");
    this.sort = "";
    
    this.$sort = $("#sort")
      .change(function() {
        self.updateSort();
      });

    this.updateSort();
  },
  
  updateSort: function() {
    var sort = this.$sort.val();
    if (sort == this.sort) {
      return;
    }
    
    this.sort = sort;
    this.$albums.empty();
    this.start = 0;
    this.loadMore();
  }, 
  
  loadMore: function() {
    var self = this;
    if (this.loading || this.done) {
      return;
    }
    
    this.loading = true;
    var $loading = $("<div class='loading'>Loading</div>")
      .appendTo(this.$el);
      
    R.request({
      method: "getAlbumsInCollection", 
      content: {
        user: R.currentUser.get("key"), 
        start: this.start,
        count: this.count,
        extras: "-*,artist,icon,name,shortUrl,canStream",
        sort: this.sort
      }, 
      complete: function(data) {
        self.loading = false;
        self.start += self.count;
        $loading.remove();
        if (data && data.result && data.result.length) {
          _.each(data.result, function(v, i) {
            if (!v.canStream) {
              return;
            }
            
            var album = new Album(v);
            self.$albums
              .append(album.$el);
          });
        } else {
          self.done = true;
        }
      }
    });      
  }
};
