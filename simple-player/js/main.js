/*globals R, Main, Modernizr, rdioUtils */

(function() {

  window.Main = {
    // ----------
    init: function() {
      var self = this;
      
      this.$input = $(".search input");
      this.$results = $(".results");

      var rawTemplate = $.trim($("#album-template").text());
      this.albumTemplate = _.template(rawTemplate);

      if (Modernizr.touch) {
        self.$results
          .click(function() {
            $(".album").removeClass("hover");          
          });
      } else {
        _.defer(function() {
          self.$input.focus();
        });
      }
              
      $(".search")
        .submit(function(event) {
          event.preventDefault();
          var query = self.$input.val();
          if (query) {
            R.ready(function() { // just in case the API isn't ready yet
              self.search(query);
            });
          }
        });
        
      if (!rdioUtils.startupChecks()) {
        return;
      }

      R.ready(function() {
        var $play = $(".header .play")
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
        
        R.player.on("change:playingTrack", function(track) {
          $(".header .icon").attr("src", track.get("icon"));
          $(".header .track").text("Track: " + track.get("name"));
          $(".header .album-title").text("Album: " + track.get("album"));
          $(".header .artist").text("Artist: " + track.get("artist"));
        });
        
        R.player.on("change:playState", function(state) {
          if (state === R.player.PLAYSTATE_PLAYING || state === R.player.PLAYSTATE_BUFFERING) {
            $play.text("pause");
          } else {
            $play.text("play");
          }
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
    },
    
    // ----------
    showResults: function(albums) {
      var self = this;
      this.$results.empty();
      
      _.each(albums, function(album) {
        album.appUrl = album.shortUrl.replace("http", "rdio");        
        var $el = $(self.albumTemplate(album))
          .appendTo(self.$results);
        
        var $cover = $el.find(".icon");
        if (Modernizr.touch) {  
          $cover.click(function(event) {
            event.stopPropagation();
            if (!$el.hasClass("hover")) {
              $(".album").not($el).removeClass("hover");
              $el.addClass("hover");
            }
          });
        } else {
          $cover.hover(function() {
            $el.addClass("hover");
          }, function() {
            $el.removeClass("hover");
          });
        }
        
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
