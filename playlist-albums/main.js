/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    albums: [],

    // ----------
    init: function() {
      var self = this;

      this.currentAlbums = [];
      this.possibleAlbums = [];

      if (!rdioUtils.startupChecks()) {
        return;
      }

      $('.go')
        .click(function() {
          var url = $('.url').val();
          url = url.replace(/^http:\/\/www\.rdio\.com/i, '');
          R.ready(function() {
            self.load(url);
          });
        });
    },

    load: function(url) {
      $('.albums').empty();
      R.request({
        method: 'getObjectFromUrl',
        content: {
          url: url,
          extras: 'tracks'// 'tracks,-tracks.*,tracks.albumKey'
        },
        success: function(data) {
          // console.log(data);
          var albums = {};
          _.each(data.result.tracks, function(v, i) {
            if (!albums[v.albumKey]) {
              var album = albums[v.albumKey] = {
                icon: v.icon,
                name: v.album,
                artist: v.albumArtist,
                url: v.albumUrl,
                artistUrl: v.artistUrl,
                length: 0,
                key: v.albumKey
              };

              var widget = rdioUtils.albumWidget(album);
              var $widget = $(widget.element());
              $('.albums').append($widget);
            }
          });
        }
      });
    },

    // ----------
    template: function(name, config) {
      var rawTemplate = $.trim($("#" + name + "-template").text());
      var template = _.template(rawTemplate);
      var html = template(config);
      return $(html);
    }
  };

  // ----------
  $(document).ready(function() {
    Main.init();
  });

})();
