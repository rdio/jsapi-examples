/*globals R, Main */

(function() {

  window.Main = {
    // ----------
    init: function() {
      var self = this;
      
      $(".header .play")
        .click(function() {
          R.player.togglePause();
        });
      
      $(".header .next")
        .click(function() {
          R.player.next();
        });
      
      $(".header .prev")
        .click(function() {
          R.player.previous();
        });
      
      this.$input = $(".search input");
      _.defer(function() {
        self.$input.focus();
      });
        
      $(".search")
        .submit(function(event) {
          event.preventDefault();
          var query = self.$input.val();
          if (query) {
            self.search(query);
          }
        });
        
      R.ready(function() {
        R.player.on("change:playingTrack", function(track) {
          $(".header .icon").attr("src", track.get("icon"));
          $(".header .track").text("Track: " + track.get("name"));
          $(".header .title").text("Album: " + track.get("album"));
          $(".header .artist").text("Artist: " + track.get("artist"));
        });
        
        R.request({
          method: "getTopCharts", 
          content: {
            type: "Album"
          },
          success: function(response) {
            self.showResults(response.result);
          },
          error: function(response) {
            $(".error").text(response.message);
          }
        });
      });
    }, 
    
    // ----------
    search: function(query) {
      var self = this;
      R.ready(function() { // just in case the API isn't ready yet
        R.request({
          method: "search", 
          content: {
            query: query, 
            types: "Album"
          },
          success: function(response) {
            self.$input.val("");
            self.showResults(response.result.results);
          },
          error: function(response) {
            $(".error").text(response.message);
          }
        });
      });
    },
    
    // ----------
    showResults: function(albums) {
      var $results = $(".results")
        .empty();
        
      var template = _.template($("#album-template").text());

      _.each(albums, function(album) {
        var $el = $(template(album))
          .appendTo($results);
          
        $el.find(".play")
          .click(function() {
            R.player.play({source: album.key});
          });
      });
    }
  };
  
  // ----------
  $(document).ready(function() {
    Main.init();
  });
  
})();  
