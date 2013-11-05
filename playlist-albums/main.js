/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    // ----------
    init: function() {
      var self = this;

      if (!rdioUtils.startupChecks()) {
        return;
      }

      $('.url-form')
        .submit(function(event) {
          event.preventDefault();
          event.stopPropagation();
          self.go();
        });

      setTimeout(function() {
        $('.url').focus();
      }, 1);
    },

    go: function() {
      var self = this;
      var url = $('.url').val();
      if (!url) {
        return;
      }

      url = url.replace(/^http:\/\/www\.rdio\.com/i, '');
      R.ready(function() {
        self.load(url);
      });
    },

    load: function(url) {
      var self = this;

      $('.albums').empty();
      R.request({
        method: 'getObjectFromUrl',
        content: {
          url: url,
          extras: '[{"field": "tracks", "extras": ["-*","albumKey"]}]'
        },
        success: function(data) {
          self.template('playlist-info', data.result).appendTo('.albums');

          var albumKeys = _.uniq(_.map(data.result.tracks, function(v, i) {
            return v.albumKey;
          }));

          R.request({
            method: 'get',
            content: {
              keys: albumKeys.join(','),
              extras: '-*,icon,name,artist,url,artistUrl,length,key'
            },
            success: function(data) {
              _.each(data.result, function(v, k) {
                var widget = rdioUtils.albumWidget(v);
                var $widget = $(widget.element());
                $('.albums').append($widget);
              });
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
