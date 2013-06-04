/*globals Main, R */

(function() {

  // ----------
  Main.Views.Following = function(config) {
    var self = this;

    this.$el = config.$el;
    this.$people = {};

    R.ready(function() {
      R.currentUser.trackFollowing(function() {
        var following = R.currentUser.get('following');

        following.on('change:online', function(person, online) {
          if (online) {
            self.addPerson(person);
          } else {
            self.removePerson(person);
          }
        });

        following.on('add', function(person) {
          person.trackPresence();
        });

        following.on('remove', function(person) {
          self.removePerson(person);
          person.untrackPresence();
        });

        var person;
        for (var a = 0; a < following.length; a++) {
          person = following.at(a);
          person.trackPresence();
          if (person.get('online')) {
            self.addPerson(person);
          }
        }
      });
    });
  };
  
  // ----------
  Main.Views.Following.prototype = {
    // ----------
    addPerson: function(person) {
      var key = person.get('key');
      if (this.$people[key]) {
        return;
      }

      var $person = Main.template('person')
        .appendTo(this.$el);

      var personUrl = person.get('url');
      $person.find('.icon')
        .prop({
          href: (personUrl ? 'http://www.rdio.com' + personUrl : '')
        })
        .css({
          'background-image': 'url("' + person.get('icon') + '")'
        });

      var updateAlbumCover = function() {
        var track = person.get('lastSongPlayed');
        if (track) {
          $person.find('.album')
            .prop({
              href: (track.url ? 'http://www.rdio.com' + track.url : '')
            })
            .css({
              'background-image': 'url("' + track.icon + '")'
            });
        }
      };
      
      person.on('change:lastSongPlayed', function(track) {
        updateAlbumCover();
      });

      person.trackField('lastSongPlayed');
      updateAlbumCover();
      this.$people[key] = $person;
    },

    // ----------
    removePerson: function(person) {
      var key = person.get('key');
      var $person = this.$people[key];
      if (!$person) {
        return;
      }

      person.off('change:lastSongPlayed');
      person.untrackField('lastSongPlayed');

      $person.remove();
      delete this.$people[key];
    }
  };

})();
