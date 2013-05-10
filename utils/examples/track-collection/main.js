/*globals rdioUtils, Main */

(function() {

  window.Main = {
    // ----------
    init: function() {
      rdioUtils.authWidget($('.auth'));

      var collection = rdioUtils.trackCollection({
        onPartialLoad: function(albums) {
          var $content = $('.content');
          for (var i = 0; i < albums.length; i++) {
            $('<img>')
              .addClass('album')
              .prop('src', albums[i].icon)
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
