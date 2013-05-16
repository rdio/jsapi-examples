/*globals R, Main, Spinner, rdioUtils */

window.Main = {
  spinner: null,
  views: {}, 
  mode: "", 
  
  init: function() {
    var self = this;

    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
    };
    
    var $window = $(window)
      .resize(function() {
        self.layout();
      });
    
    var $document = $(document)
      .bind("scroll", function() {
        var scroll = $document.scrollTop();
        if (scroll > ($document.height() - ($window.height() * 2))) {
          if (self.mode && self.views[self.mode] && self.views[self.mode].loadMore) {
            self.views[self.mode].loadMore();
          }
        }
      });

    if (!rdioUtils.startupChecks()) {
      return;
    }

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
  
  layout: function(options) {
    options = options || {};
  }, 
  
  spin: function(value) {
    if (value) {
      this.spinner = new Spinner().spin($("body")[0]);     
    } else {
      this.spinner.stop();
    }
  },
  
  template: function(name, config) {
    var rawTemplate = $.trim($("#" + name + "-template").text());
    var template = _.template(rawTemplate);
    var html = template(config);
    return $(html);
  }
};

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

$(document).ready(function() {
  Main.init();
});

