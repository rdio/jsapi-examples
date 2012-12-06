/*globals Main, R, Modernizr */

(function() {

  // ==========
  Main.Views.Album = function(album) {
    var self = this;
    this.model = album;
    this.shown = true;
    this.iconShown = false;
    this.$el = $(Main.Views.Album.template(this.model.toJSON()));
      
    this.$cover = this.$el.find(".icon");
    if (Modernizr.touch) {  
      this.$cover.click(function(event) {
        event.stopPropagation();
        if (!self.$el.hasClass("hover")) {
          $(".album").not(self.$el).removeClass("hover");
          self.$el.addClass("hover");
        }
      });
    } else {
      this.$cover.hover(function() {
        self.$el.addClass("hover");
      }, function() {
        self.$el.removeClass("hover");
      });
    }
    
    this.$el.find(".play")
      .click(function() {
        R.player.play({source: self.model.get('key')});
      });
  };
    
  Main.Views.Album.prototype = {
    // ----------
    toggle: function(flag) {
      this.$el.toggle(flag);
      this.shown = flag;
    },
    
    // ----------
    showIcon: function() {
      this.$cover.css('background-image', 'url("' + this.model.get('icon') + '")');
      this.iconShown = true;
    }
  }; 
  
  _.extend(Main.Views.Album, {
    // ----------
    init: function() {
      this.template = _.template($("#album-template").text());
    }
  });

})();