/*globals R, Main, Spinner */

(function() {

  // ==========
  window.Main = {
    Models: {},
    Views: {},
    currentView: null,
    
    // ----------
    init: function() {
      var self = this;
      
      if (!("R" in window)) {
        this.go("no-rdio");
        return;
      }

      R.ready(function() {
        self.spin(false);
        if (R.authenticated()) {
          self.go("following");
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
        this.currentView = new this.Views[viewClass]({
          $el: $div
        });
      }
    },
    
    // ----------
    spin: function(value) {
      if (value) {
        this.spinner = new Spinner({
          radius: 6,
          length: 6,
          width: 2,
          color: '#444'
        }).spin($("#spin-container")[0]);     
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
