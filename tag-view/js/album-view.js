/*globals Main, R, Modernizr */

(function() {

  Main.Views.Album = function(album) {
    var self = this;
    this.model = album;
    this.$el = $(Main.Views.Album.template(this.model.toJSON()));
      
    var $cover = this.$el.find(".icon");
    if (Modernizr.touch) {  
      $cover.click(function(event) {
        event.stopPropagation();
        if (!self.$el.hasClass("hover")) {
          $(".album").not(self.$el).removeClass("hover");
          self.$el.addClass("hover");
        }
      });
    } else {
      $cover.hover(function() {
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
  
  _.extend(Main.Views.Album, {
    init: function() {
      this.template = _.template($("#album-template").text());
    }
  });

})();