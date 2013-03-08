/*globals Main, Spinner, R, Music, Album, zot */

(function() {

  // ----------
  window.Album = function(config) {
    this.isSmall = false;
    this.key = (config.type == "a" ? config.key : config.albumKey); 
    this.url = "http://www.rdio.com" + config.url; 
    this.icon = config.icon;
    this.trackKeys = _.clone(config.trackKeys);
    this.$el = null;
  };
          
  Album.prototype = {
    // ----------
    viable: function() {
      return (this.key && _.isArray(this.trackKeys) && this.trackKeys.length);
    },

    // ----------
    create: function() {
      var self = this;
      zot.assert(!this.$el, "don't create twice");
      
      this.spinner = new Spinner({
        color: "#fff", 
        shadow: true
      });
    
      var templateData = {
        key: this.key, 
        url: this.url, 
        icon: this.icon
      };
    
      this.$el = $(Main.albumTemplate(templateData))
        .appendTo("body");
        
      if (this.isSmall) {
        this.$el.addClass("small");  
      }

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
              keys: self.trackKeys.join(", ")
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
    },
    
    // ----------
    destroy: function() {
      var self = this;
      if (this.$el) {
        this.$el
          .fadeOut(1000, function() {
            self.$el.remove();
          });
      }
    },
    
    // ----------
    becomeSmall: function() {
      this.isSmall = true;
      Music.stop(this);

      if (this.$el) {
        this.$el.addClass("small");  
      }
    },
    
    // ----------
    updatePlaying: function(v) {
      if (this.isSmall) {
        return;
      }
      
      this.$sample.toggleClass("selected", v !== 0);
    }
  };

})();
