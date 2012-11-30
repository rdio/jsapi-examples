/*globals Main, R, Backbone */

(function() {

  Main.Models.Album = Backbone.Model.extend({
    initialize: function() {
      this.set({
        appUrl: this.get('shortUrl').replace("http", "rdio")
      });
      
      Main.tags.addAlbum(this);
    }
  });

})();