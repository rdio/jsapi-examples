/*globals rdioUtils, Main */

(function() {

  window.Main = {
    // ----------
    init: function() {
      rdioUtils.authWidget($('.auth'));

      var collection = rdioUtils.trackCollection({
        onLoaded: function() {
          var $content = $('.content').empty();
          for (var i = 0; i < collection.length; i++) {
            $('<img>')
              .prop('src', collection.at(i).icon)
              .appendTo($content);
          }
        }
      });
    }
  };

  $(document).ready(function() {
    Main.init();
  });

})();
