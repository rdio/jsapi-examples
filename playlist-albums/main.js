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
          self.go();
        });

      $('.user-form')
        .submit(function(event) {
          event.preventDefault();
          self.goForUser();
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

    goForUser: function() {
      var self = this;
      var user = $('.user').val();
      if (!user) {
        return;
      }

      R.ready(function() {
        self.loadUser(user);
      });
    },

    loadUser: function(user) {
      var self = this;

      $('.albums').empty();
      R.request({
        method: 'findUser',
        content: {
          vanityName: user
        },
        success: function(data) {
          var username = data.result.firstName + ' ' + data.result.lastName;
          R.request({
            method: 'getUserPlaylists',
            content: {
              user: data.result.key,
              count: 100
            },
            success: function(data) {
              var $playlists = self.template('user-playlists', {
                username: username,
                playlists: data.result
              }).appendTo('.albums');

              $playlists.find('a')
                .click(function(event) {
                  event.preventDefault();
                  var $target = $(event.target);
                  self.load($target.prop('href'));
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
