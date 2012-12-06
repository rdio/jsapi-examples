/*globals Main, R, Backbone */

(function() {

  // ==========
  Main.Models.Album = Backbone.Model.extend({
    // ----------
    initialize: function() {
      this.set({
        appUrl: this.get('shortUrl').replace("http", "rdio")
      });
      
      if (!this.get('tags')) {
        this.set({tags: []});
      }
      
      if (!this.get('tags').length) {
        Main.tags.addAlbum(this);
      }
    },
    
    // ----------
    addTag: function(tag) {
      var tags = this.get('tags');
      if (_.indexOf(tags, tag) == -1) {
        tags.push(tag);
        this.trigger('add:tag');
      }
    }    
  });

})();