/*globals rdioUtils, Main */

(function() {

  window.Main = {
    // ----------
    init: function() {
      rdioUtils.authWidget($('.auth'));

      this.collection = rdioUtils.trackCollection({
        onPartialLoad: function(albums) {
          var $content = $('.content');
          for (var i = 0; i < albums.length; i++) {
            $('<img>')
              .addClass('album')
              .prop('src', albums[i].icon)
              .appendTo($content);
          }
        },
        onAdded: function(albums) {
          console.log('added', albums);
        },
        onRemoved: function(albums) {
          console.log('removed', albums);
        }
      });
    }
  };

  $(document).ready(function() {
    Main.init();
  });

})();
