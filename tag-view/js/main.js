/*globals R, Main, Spinner, rdioUtils */

(function() {

  // ==========
  window.Main = {
    Models: {},
    Views: {},
    currentView: null,
    
    // If you use this code, please change this to your own last.fm API key,
    // which you can get at http://www.last.fm/api/account/create  
    lastfmKey: 'c277ae1f0edb1b0aa6d1a2398c767d70',
    
    // ----------
    init: function() {
      var self = this;
      
      if (!rdioUtils.startupChecks()) {
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
      var viewClass = this.upperCaseInitial(this.mode);
      if (viewClass in this.Views) {
        this.currentView = new this.Views[viewClass]();
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
      var rawTemplate = $.trim($("#" + name + "-template").text());
      var template = _.template(rawTemplate);
      var html = template(config);
      return $(html);
    },

    // ----------
    upperCaseInitial: function(val) {
      return val.replace(/^([a-z])/, function($0, $1) {
        return $1.toUpperCase();
      });
    }
  };
  
  // ----------
  $(document).ready(function() {
    Main.init();
  });
  
})();  
