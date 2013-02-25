/*globals Main, R, Spinner, alert */

(function() {

  // ==========
  Main.CollectionButton = function($el) {
    var self = this;
    this.albumKey = '';

    this.$el = $el
      .click(function() {
        self.addToCollection();
      });

    this.spinner = new Spinner({
      color: '#fff', 
      shadow: true
    });

    this.checkSource(R.player.playingSource());
    R.player.on('change:playingSource', this.checkSource, this);
  };
  
  Main.CollectionButton.prototype = {
    // ----------
    checkSource: function(source) {
      var key = (source ? source.get('key') : '');
      if (key == this.albumKey) {
        return;
      }

      this.albumKey = key;

      var type = (source ? source.get('type') : '');
      if (type == 'al') {
        // Note that this is not actually a good way of knowing if the album is already in your collection;
        // it's only an indication that you played the album from your collection... if you instead played
        // it from somewhere else (even though it's part of your collection), it'll just be type 'a'.
        // TODO: Select the button if the source is in your collection, regardless of where it was played from.
        this.select();
      } else if (type == 'a' || type == 'p' || type == 't') {
        this.reset();
      } else {
        this.disable();
      }
    },
    
    // ----------
    select: function() {
      this.$el
        .removeClass('disabled')
        .addClass('selected')
        .prop('title', 'In collection');
    },

    // ----------
    reset: function() {
      this.$el
        .removeClass('disabled selected')
        .prop('title', 'Add to collection');
    },

    // ----------
    disable: function() {
      this.$el
        .removeClass('selected')
        .addClass('disabled')
        .prop('title', 'Unable to add this source to collection');
    },

    // ----------
    addToCollection: function() {
      var self = this;

      var source = R.player.playingSource();
      var type = (source ? source.get('type') : '');
      var keys = '';
      if (type == 'a') {
        keys = source.get('trackKeys').join(',');
      } else if (type == 'p' || type == 't') {
        keys = source.get('key');
      } 

      if (!keys) {
        return;
      }
    
      this.spinner.spin(this.$el[0]);
      R.request({
        method: 'addToCollection', 
        content: {
          keys: keys
        }, 
        complete: function(data) {
          self.spinner.stop();
          if (data.status == 'ok') {
            self.select();
          } else {
            alert('There was an error adding this album to your collection.');
          }
        }
      });
    }
  };

})();
