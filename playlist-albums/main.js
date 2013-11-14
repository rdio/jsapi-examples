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

      rdioUtils.authWidget($('.auth-widget'));
      R.on('change:authenticated', function() {
        R.ready(function() {
          if (!R.authenticated()) {
            return;
          }

          var url = R.currentUser.get('url');
          $('.auth-widget').wrapInner('<a href="#' + url + '">');

          if (!location.hash.replace(/^#/, '')) {
            location.hash = url;
          }          
        });
      });

      $('.url').val('');
      $('.url-form')
        .submit(function(event) {
          event.preventDefault();
          self.go();
          $('.url').val('');
        });

      $('.user').val('');
      $('.user-form')
        .submit(function(event) {
          event.preventDefault();
          self.goForUser();
          $('.user').val('');
        });

      setTimeout(function() {
        $('.user').focus();
      }, 1);

      R.ready(function() {
        self.hashChanged();
        $(window).bind('hashchange', function(event) {
          self.hashChanged();
        });  
      });
    },

    // ----------
    hashChanged: function() {
      var hash = location.hash.replace(/^#/, '');
      if (!/^\/people\//.test(hash)) {
        return;
      }

      if (/\/playlists\//.test(hash)) {
        this.load(hash);
      } else {
        this.loadUser(hash);      
      }
    },

    // ----------
    go: function() {
      var self = this;
      var url = $('.url').val();
      if (!url) {
        return;
      }

      url = url.replace(/^http:\/\/www\.rdio\.com/i, '');
      location.hash = url;
    },

    // ----------
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
          var $info = self.template('playlist-info', data.result).appendTo('.albums');

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
    goForUser: function() {
      var self = this;
      var user = $('.user').val();
      if (!user) {
        return;
      }

      location.hash = '/people/' + user + '/';
    },

    // ----------
    loadUser: function(url) {
      var self = this;

      R.request({
        method: 'getObjectFromUrl',
        content: {
          url: url
        },
        success: function(data) {
          var username = data.result.firstName + ' ' + data.result.lastName;
          self.loadUserByKey(data.result.key, username);
        }
      });
    },

    // ----------
    loadUserByKey: function(key, username) {
      var self = this;
      
      $('.albums').empty();
      R.request({
        method: 'getUserPlaylists',
        content: {
          user: key,
          count: 100
        },
        success: function(data) {
          var $playlists = self.template('user-playlists', {
            username: username,
            playlists: data.result
          }).appendTo('.albums');
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
