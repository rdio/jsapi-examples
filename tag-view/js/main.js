/*globals R, Main, Spinner */

(function() {

  // ==========
  window.Main = {
    Models: {},
    Views: {},
    views: {},
    
    // If you use this code, please change this to your own last.fm API key,
    // which you can get at http://www.last.fm/api/account/create  
    lastfmKey: 'c277ae1f0edb1b0aa6d1a2398c767d70',
    
    // ----------
    init: function() {
      var self = this;
      
      if (!("R" in window)) {
        this.go("no-rdio");
        return;
      }

      this.resetFlag = (location.search.search('reset=true') != -1); 
      this.tags.initialize();
      this.collection.initialize();
      this.Views.Album.init();

      R.ready(function() {
        self.spin(false);
        if (R.authenticated()) {
          self.go("collection");
        } else {
          self.go("unauthenticated");
        }          
      });
      
      this.spin(true);
    }, 
    
    // ----------
    go: function(mode) {
      var $div = $("<div>")
        .attr("id", mode)
        .append(this.template(mode));
        
      $("#content")
        .empty()
        .append($div);
        
      this.mode = mode;
      if (mode in this.views) {
        this.views[mode].init();
      }
    },
    
    // ----------
    spin: function(value) {
      if (value) {
        this.spinner = new Spinner().spin($("body")[0]);     
      } else {
        this.spinner.stop();
      }
    },
    
    // ----------
    template: function(name, config) {
      var rawTemplate = $("#" + name + "-template").text();
      var template = _.template(rawTemplate);
      var html = template(config);
      return $(html);
    }
  };
  
  // ----------
  Main.views.unauthenticated = {
    init: function() {
      $("#authenticate")
        .click(function() {
          R.authenticate(function(authenticated) {
            if (authenticated) {
              Main.go("collection");
            }
          });
        });
    }
  };

  // ----------
  $(document).ready(function() {
    Main.init();
  });
  
})();  
