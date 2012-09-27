/*globals Main, Spinner, R, Music, Album */

(function() {

  window.Album = function(config) {
    var self = this;
    
    this.isSmall = false;
  
    var keyRegex = /al(.*)\|.*/;
    if (keyRegex.test(config.key)) {
      this.key = config.key.replace(keyRegex, "a$1");
    } else {
      this.key = config.key;
    }
    
    this.spinner = new Spinner({
      color: "#fff", 
      shadow: true
    });
  
    var templateData = _.extend({}, config, {
      key: this.key,
      url: "http://rdio.com" + config.url
    });
  
    this.$el = $(Main.albumTemplate(templateData))
      .appendTo("body");
      
    this.$el.find(".no")
      .click(function() {
        Main.rejectAlbum(self);
        Main.save(self.key, {rejected: true});
      });
      
    this.$el.find(".yes")
      .click(function() {
        Main.collectAlbum(self);
        self.spinner.spin(self.$el[0]);
        
        R.request({
          method: "addToCollection", 
          content: {
            keys: config.trackKeys.join(", ")
          }, 
          complete: function(data) {
            self.spinner.stop();
            if (data.status == "ok") {
              Main.save(self.key, {collected: true});
            } else {
              alert("There was an error adding this album to your collection; you may need to log in.");
            }
          }
        });
      });
  
    this.$sample = this.$el.find(".sample")
      .click(function() {
        Music.toggle(self);
      });
  };
  
  Album.prototype = {
    destroy: function() {
      var self = this;
      this.$el
        .fadeOut(1000, function() {
          self.$el.remove();
        });
    },
    
    becomeSmall: function() {
      this.isSmall = true;
      this.$el.addClass("small");  
      Music.stop(this);
    },
    
    updatePlaying: function(v) {
      if (this.isSmall) {
        return;
      }
      
      this.$sample.toggleClass("selected", v !== 0);
    }
  };

})();
