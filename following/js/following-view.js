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

        for (var a = 0; a < following.length; a++) {
          following.at(a).trackPresence();
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

      $person.find('.icon')
        .css({
          'background-image': 'url("' + person.get('icon') + '")'
        });

      person.on('change:lastSongPlayed', function(track) {
        $person.find('.album')
          .css({
            'background-image': 'url("' + track.icon + '")'
          });
      });

      person.trackField('lastSongPlayed');

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
